import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { NeoIconButton } from '../components/NeoIconButton';
import { NeoInput } from '../components/NeoInput';
import { supabase } from '../lib/supabase';

export const CreateMatchScreen = ({ route, navigation }: any) => {
  const { juntada, attendees } = route.params;
  const [gameName, setGameName] = useState('');
  const [mode, setMode] = useState<'estandar' | 'torneo' | 'asimetrico'>('estandar');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedWinners, setSelectedWinners] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupGames, setGroupGames] = useState<string[]>([]);
  const [isNewGame, setIsNewGame] = useState(true);

  useEffect(() => {
    const fetchGroupGames = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('games_played')
        .eq('id', juntada.group_id)
        .single();
      
      if (data && data.games_played && data.games_played.length > 0) {
        setGroupGames(data.games_played);
        setGameName(data.games_played[0]);
        setIsNewGame(false);
      }
    };
    fetchGroupGames();
  }, [juntada.group_id]);

  const togglePlayer = (userId: string) => {
    if (selectedPlayers.includes(userId)) {
      setSelectedPlayers(prev => prev.filter(id => id !== userId));
      setSelectedWinners(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedPlayers(prev => [...prev, userId]);
    }
  };

  const toggleWinner = (userId: string) => {
    if (selectedWinners.includes(userId)) {
      setSelectedWinners(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedWinners(prev => [...prev, userId]);
    }
  };

  const handleCreate = async () => {
    if (!gameName.trim()) {
      Alert.alert('Error', 'Debes ingresar el nombre del juego.');
      return;
    }
    if (selectedPlayers.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos un jugador.');
      return;
    }

    setLoading(true);
    try {
      // 1. Buscar o Crear Juego
      let gameId = null;
      const { data: existingGames, error: fetchGameError } = await supabase
        .from('games')
        .select('id')
        .ilike('name', gameName.trim())
        .eq('mode', mode);

      if (fetchGameError) throw fetchGameError;

      if (existingGames && existingGames.length > 0) {
        gameId = existingGames[0].id;
      } else {
        const { data: newGame, error: insertGameError } = await supabase
          .from('games')
          .insert({ name: gameName.trim(), mode })
          .select('id')
          .single();
          
        if (insertGameError) throw insertGameError;
        gameId = newGame.id;
        
        // Agregar al array games_played si es nuevo
        if (isNewGame) {
          const updatedGames = [...groupGames, gameName.trim()];
          await supabase
            .from('groups')
            .update({ games_played: updatedGames })
            .eq('id', juntada.group_id);
        }
      }

      // 2. Crear Partida
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({ juntada_id: juntada.id, game_id: gameId })
        .select('id')
        .single();
        
      if (matchError) throw matchError;

      // 3. Insertar Jugadores y calcular Puntos
      let pointsToAward = 0;
      if (mode === 'estandar') pointsToAward = 1;
      if (mode === 'torneo') pointsToAward = 2;
      if (mode === 'asimetrico') pointsToAward = 1;

      const matchPlayersData = selectedPlayers.map(userId => ({
        match_id: match.id,
        user_id: userId,
        is_winner: selectedWinners.includes(userId),
        points_earned: selectedWinners.includes(userId) ? pointsToAward : 0
      }));

      const { error: matchPlayersError } = await supabase
        .from('match_players')
        .insert(matchPlayersData);

      if (matchPlayersError) throw matchPlayersError;

      // 4. Actualizar Puntos Totales en group_members
      if (pointsToAward > 0) {
        for (const winnerId of selectedWinners) {
          const { data: member } = await supabase
             .from('group_members')
             .select('points')
             .eq('group_id', juntada.group_id)
             .eq('user_id', winnerId)
             .single();
             
          if (member) {
             await supabase
               .from('group_members')
               .update({ points: member.points + pointsToAward })
               .eq('group_id', juntada.group_id)
               .eq('user_id', winnerId);
          }
        }
      }

      Alert.alert('¡Partida Registrada!', 'Los puntos han sido asignados correctamente.');
      navigation.goBack();

    } catch (error: any) {
      Alert.alert('Error al registrar', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require('../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.title} maxFontSizeMultiplier={1.2} adjustsFontSizeToFit>REGISTRAR PARTIDA</Text>
          </View>
          <NeoIconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="secondary" />
        </View>

        <NeoCard style={styles.card}>
          <Text style={styles.label}>Juego</Text>
          {isNewGame ? (
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <NeoInput
                  placeholder="Ej: Metegol, UNO, FIFA..."
                  value={gameName}
                  onChangeText={setGameName}
                />
              </View>
              {groupGames.length > 0 && (
                <NeoIconButton icon="close" onPress={() => setIsNewGame(false)} variant="secondary" />
              )}
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View style={[styles.pickerContainer, { flex: 1 }]}>
                <Picker
                  selectedValue={gameName}
                  onValueChange={(itemValue) => setGameName(itemValue)}
                >
                  {groupGames.map((g, i) => (
                    <Picker.Item key={i} label={g} value={g} />
                  ))}
                </Picker>
              </View>
              <NeoButton title="+" onPress={() => {
                setGameName('');
                setIsNewGame(true);
              }} />
            </View>
          )}

          <Text style={[styles.label, { marginTop: 15 }]}>Modalidad</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={mode}
              onValueChange={(itemValue) => setMode(itemValue as any)}
            >
              <Picker.Item label="Estándar" value="estandar" />
              <Picker.Item label="Torneo" value="torneo" />
              <Picker.Item label="Asimétrico" value="asimetrico" />
            </Picker>
          </View>
          <Text style={styles.helperText}>
            {mode === 'estandar' && 'Victoria = 1 Pto.'}
            {mode === 'torneo' && 'Campeón = 2 Pts.'}
            {mode === 'asimetrico' && 'Un jugador contra todos los demás. Si gana el jugador solitario obtiene 1 punto, si gana el resto nadie suma.'}
          </Text>

          <View style={styles.spacer} />

          <Text style={styles.label}>Jugadores Participantes</Text>
          <View style={styles.selectionGrid}>
            {attendees.map((a: any) => {
              const isSelected = selectedPlayers.includes(a.user_id);
              return (
                <TouchableOpacity 
                  key={a.user_id} 
                  style={[styles.badge, isSelected && styles.badgeSelected]} 
                  onPress={() => togglePlayer(a.user_id)}
                >
                  <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>
                    {a.profiles?.username}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {selectedPlayers.length > 0 && (
            <>
              <View style={styles.spacer} />
              <Text style={styles.label}>¿Quién ganó?</Text>
              <View style={styles.selectionGrid}>
                {selectedPlayers.map(id => {
                  const attendee = attendees.find((a: any) => a.user_id === id);
                  const isWinner = selectedWinners.includes(id);
                  return (
                    <TouchableOpacity 
                      key={id} 
                      style={[styles.badge, isWinner && styles.badgeWinner]} 
                      onPress={() => toggleWinner(id)}
                    >
                      <Text style={[styles.badgeText, isWinner && styles.badgeTextSelected]}>
                        {attendee?.profiles?.username}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </>
          )}

          <View style={styles.spacer} />
          
          <View style={{ gap: 8 }}>
            <NeoButton 
              title={loading ? 'Guardando...' : 'Guardar Partida'} 
              onPress={handleCreate} 
              disabled={loading}
            />
            
            <NeoButton 
              title="Cancelar" 
              onPress={() => navigation.goBack()} 
              variant="secondary"
            />
          </View>
        </NeoCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.border,
    paddingBottom: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  card: {
    padding: 24,
  },
  label: {
    fontSize: theme.typography.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    marginBottom: 8,
  },

  helperText: {
    fontSize: 12,
    color: theme.colors.text,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
  },
  badgeSelected: {
    backgroundColor: theme.colors.primary,
  },
  badgeWinner: {
    backgroundColor: theme.colors.secondary,
  },
  badgeText: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  badgeTextSelected: {
    color: theme.colors.background,
  },
  spacer: {
    height: 16,
  }
});
