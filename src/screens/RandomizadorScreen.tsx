import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, KeyboardAvoidingView, Platform, Keyboard, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { NeoIconButton } from '../components/NeoIconButton';
import { NeoInput } from '../components/NeoInput';
import { supabase } from '../lib/supabase';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { shuffleArray, generateNextBracketRound } from '../utils/tournamentLogic';

export const RandomizadorScreen = ({ route, navigation }: any) => {
  const { juntada } = route.params;
  
  // Modes: 'teams', 'list', 'bracket', 'number'
  const [activeMode, setActiveMode] = useState('teams');
  const [attendees, setAttendees] = useState<any[]>([]);

  // States for teams
  const [teamSize, setTeamSize] = useState('2');
  const [teamResults, setTeamResults] = useState<any[][]>([]);

  // States for list
  const [listResults, setListResults] = useState<any[]>([]);

  // States for bracket
  const [bracketTeamsInput, setBracketTeamsInput] = useState('');
  const [bracketRounds, setBracketRounds] = useState<any[][][]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [matchWinners, setMatchWinners] = useState<{ [matchIndex: number]: string }>({});

  // States for number
  const [minNum, setMinNum] = useState('1');
  const [maxNum, setMaxNum] = useState('100');
  const [numResult, setNumResult] = useState<number | null>(null);

  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    const { data, error } = await supabase
      .from('juntada_attendees')
      .select('*, profiles(id, username)')
      .eq('juntada_id', juntada.id);
    
    if (data) {
      setAttendees(data.map(d => d.profiles));
    }
  };



  const generateTeams = () => {
    Keyboard.dismiss();
    const size = parseInt(teamSize, 10);
    if (isNaN(size) || size < 1) return;
    
    const shuffled = shuffleArray(attendees);
    const teams = [];
    for (let i = 0; i < shuffled.length; i += size) {
      teams.push(shuffled.slice(i, i + size));
    }
    setTeamResults(teams);
  };

  const generateList = () => {
    const shuffled = shuffleArray(attendees);
    setListResults(shuffled);
  };

  const generateBracket = () => {
    Keyboard.dismiss();
    const rawTeams = bracketTeamsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    if (rawTeams.length < 2) return;
    
    let shuffled = shuffleArray(rawTeams);
    let nextPower = 1;
    while (nextPower < shuffled.length) {
      nextPower *= 2;
    }
    const byes = nextPower - shuffled.length;
    
    const firstRound = [];
    let currentIndex = 0;
    
    for (let i = 0; i < nextPower / 2; i++) {
      if (i < byes) {
        firstRound.push([shuffled[currentIndex], null]); // null = BYE
        currentIndex++;
      } else {
        firstRound.push([shuffled[currentIndex], shuffled[currentIndex+1]]);
        currentIndex += 2;
      }
    }
    setBracketRounds([firstRound]);
    setCurrentRoundIndex(0);
    
    // Auto-select BYEs as winners
    const initialWinners: any = {};
    firstRound.forEach((match, idx) => {
      if (!match[1]) {
        initialWinners[idx] = match[0];
      }
    });
    setMatchWinners(initialWinners);
  };

  const handleSelectWinner = (matchIndex: number, winner: string) => {
    setMatchWinners(prev => ({ ...prev, [matchIndex]: winner }));
  };

  const generateNextRound = () => {
    const currentRound = bracketRounds[currentRoundIndex];
    if (Object.keys(matchWinners).length < currentRound.length) {
      alert("Selecciona un ganador para todos los cruces antes de continuar.");
      return;
    }

    const advancingTeams: string[] = [];
    for (let i = 0; i < currentRound.length; i++) {
      advancingTeams.push(matchWinners[i]);
    }

    const nextRound = generateNextBracketRound(advancingTeams);
    setBracketRounds(prev => [...prev, nextRound]);
    setCurrentRoundIndex(currentRoundIndex + 1);
    setMatchWinners({});
  };

  const generateNumber = () => {
    Keyboard.dismiss();
    const min = parseInt(minNum, 10);
    const max = parseInt(maxNum, 10);
    if (isNaN(min) || isNaN(max) || min > max) return;
    
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    setNumResult(result);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>RANDOMIZADOR</Text>
            <Text style={styles.subtitle} numberOfLines={1}>Juntada: {juntada.name}</Text>
          </View>
        </View>
        <NeoIconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="secondary" />
      </View>

      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <NeoButton 
            title="Equipos" 
            onPress={() => setActiveMode('teams')} 
            variant={activeMode === 'teams' ? 'primary' : 'secondary'}
            style={styles.tabBtn}
          />
          <NeoButton 
            title="Lista" 
            onPress={() => setActiveMode('list')} 
            variant={activeMode === 'list' ? 'primary' : 'secondary'}
            style={styles.tabBtn}
          />
          <NeoButton 
            title="Llaves" 
            onPress={() => setActiveMode('bracket')} 
            variant={activeMode === 'bracket' ? 'primary' : 'secondary'}
            style={styles.tabBtn}
          />
          <NeoButton 
            title="Dado" 
            onPress={() => setActiveMode('number')} 
            variant={activeMode === 'number' ? 'primary' : 'secondary'}
            style={styles.tabBtn}
          />
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {activeMode === 'teams' && (
          <NeoCard style={styles.card}>
            <Text style={styles.description}>Divide a los asistentes en equipos al azar.</Text>
            <NeoInput 
              label="Tamaño del equipo" 
              value={teamSize}
              onChangeText={setTeamSize}
              keyboardType="number-pad"
            />
            <NeoButton title="Sortear Equipos" onPress={generateTeams} />
            
            {teamResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {teamResults.map((team, idx) => (
                  <View key={idx} style={styles.teamBox}>
                    <Text style={styles.teamTitle}>EQUIPO {idx + 1}</Text>
                    {team.map((user: any) => (
                      <Text key={user.id} style={styles.teamMember}>• {user.username}</Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </NeoCard>
        )}

        {activeMode === 'list' && (
          <NeoCard style={styles.card}>
            <Text style={styles.description}>Ordena a los asistentes aleatoriamente.</Text>
            <NeoButton title="Sortear Lista" onPress={generateList} />
            
            {listResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {listResults.map((user, idx) => (
                  <Text key={user.id} style={styles.listText}>
                    {idx + 1}. {user.username}
                  </Text>
                ))}
              </View>
            )}
          </NeoCard>
        )}

        {activeMode === 'bracket' && (
          <NeoCard style={styles.card}>
            <Text style={styles.description}>Genera llaves de torneo. Separa los equipos por comas.</Text>
            <NeoInput 
              label="Equipos (separados por coma)" 
              value={bracketTeamsInput}
              onChangeText={setBracketTeamsInput}
              placeholder="Ej: A, B, C, D"
            />
            <NeoButton title="Iniciar Torneo" onPress={generateBracket} />
            
            {bracketRounds.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.bracketTitle}>
                  RONDA {currentRoundIndex + 1}
                </Text>
                
                {bracketRounds[currentRoundIndex].map((match, idx) => {
                  if (match[1] === 'WINNER') {
                    return (
                      <View key={idx} style={[styles.bracketMatch, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.bracketTeam, { color: theme.colors.background, fontSize: 24 }]}>
                          🏆 GANADOR: {match[0]}
                        </Text>
                      </View>
                    );
                  }

                  const isP1Winner = matchWinners[idx] === match[0];
                  const isP2Winner = matchWinners[idx] === match[1];
                  const isBye = !match[1];

                  return (
                    <View key={idx} style={styles.bracketMatch}>
                      <TouchableOpacity 
                        style={[styles.teamTouch, isP1Winner && styles.teamTouchWinner]} 
                        onPress={() => !isBye && handleSelectWinner(idx, match[0])}
                        disabled={isBye}
                      >
                        <Text style={[styles.bracketTeam, isP1Winner && styles.bracketTeamWinner]}>{match[0]}</Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.bracketVS}>VS</Text>
                      
                      <TouchableOpacity 
                        style={[styles.teamTouch, isP2Winner && styles.teamTouchWinner]} 
                        onPress={() => !isBye && handleSelectWinner(idx, match[1])}
                        disabled={isBye}
                      >
                        <Text style={[styles.bracketTeam, isP2Winner && styles.bracketTeamWinner, isBye && {color: '#888'}]}>
                          {match[1] ? match[1] : '(Pasa directo)'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {bracketRounds[currentRoundIndex][0]?.[1] !== 'WINNER' && (
                  <NeoButton 
                    title="Sortear Siguiente Ronda" 
                    onPress={generateNextRound} 
                    style={{ marginTop: 20 }}
                  />
                )}
              </View>
            )}
          </NeoCard>
        )}

        {activeMode === 'number' && (
          <NeoCard style={styles.card}>
            <Text style={styles.description}>Genera un número aleatorio entre dos límites.</Text>
            <View style={{flexDirection: 'row', gap: 10}}>
              <View style={{flex:1}}>
                <NeoInput 
                  label="Mínimo" 
                  value={minNum}
                  onChangeText={setMinNum}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{flex:1}}>
                <NeoInput 
                  label="Máximo" 
                  value={maxNum}
                  onChangeText={setMaxNum}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <NeoButton title="Tirar Dado" onPress={generateNumber} />
            
            {numResult !== null && (
              <View style={styles.numberResultBox}>
                <Text style={styles.numberResult}>{numResult}</Text>
              </View>
            )}
          </NeoCard>
        )}

      </ScrollView>

      <AdBannerPlaceholder />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderBottomWidth: 4, borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  headerLogo: { width: 40, height: 40, marginRight: 12 },
  title: { fontSize: 24, fontWeight: '900', color: theme.colors.primary, textTransform: 'uppercase' },
  subtitle: { fontSize: 14, color: theme.colors.text, fontWeight: 'bold' },
  tabs: {
    padding: 10, borderBottomWidth: 4, borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  tabBtn: { marginRight: 10, paddingHorizontal: 15 },
  scrollContent: { padding: 20 },
  card: { padding: 20 },
  description: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, color: theme.colors.text },
  resultsContainer: { marginTop: 20, borderTopWidth: 4, borderTopColor: theme.colors.border, paddingTop: 20 },
  teamBox: { marginBottom: 15, backgroundColor: theme.colors.background, borderWidth: 3, borderColor: theme.colors.border, padding: 15 },
  teamTitle: { fontSize: 18, fontWeight: '900', marginBottom: 10, color: theme.colors.primary },
  teamMember: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  listText: { fontSize: 18, fontWeight: '900', marginBottom: 10 },
  bracketTitle: { fontSize: 20, fontWeight: '900', marginBottom: 15, textAlign: 'center', color: theme.colors.primary },
  bracketMatch: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.colors.background, borderWidth: 3, borderColor: theme.colors.border,
    padding: 10, marginBottom: 15,
  },
  teamTouch: {
    flex: 1, padding: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent'
  },
  teamTouchWinner: {
    backgroundColor: theme.colors.secondary, borderColor: theme.colors.border
  },
  bracketTeam: { fontSize: 16, fontWeight: '900', textAlign: 'center' },
  bracketTeamWinner: { color: theme.colors.background },
  bracketVS: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary, marginHorizontal: 10 },
  numberResultBox: {
    marginTop: 20, padding: 30, backgroundColor: theme.colors.primary,
    borderWidth: 4, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center',
  },
  numberResult: { fontSize: 64, fontWeight: '900', color: theme.colors.background }
});
