import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { NeoIconButton } from '../components/NeoIconButton';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useIsFocused } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';

export const JuntadaDetailsScreen = ({ route, navigation }: any) => {
  const { juntada } = route.params;
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [juntadaState, setJuntadaState] = useState(juntada.state);
  const [photoUrl, setPhotoUrl] = useState(juntada.photo_url);
  const isFocused = useIsFocused();

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    const { data: attendeesData } = await supabase
      .from('juntada_attendees')
      .select('user_id, profiles(username)')
      .eq('juntada_id', juntada.id);
    
    setAttendees(attendeesData || []);

    const { data: matchesData } = await supabase
      .from('matches')
      .select(`
        id,
        created_at,
        games ( name, mode ),
        match_players ( is_winner, profiles ( username ) )
      `)
      .eq('juntada_id', juntada.id)
      .order('created_at', { ascending: false });

    setMatches(matchesData || []);
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const hasCheckedIn = attendees.some(a => a.user_id === currentUser?.id);
  const isCreator = currentUser?.id === juntada.created_by;

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('juntada_attendees')
        .insert({ juntada_id: juntada.id, user_id: currentUser.id });

      if (error) throw error;
      
      Alert.alert('¡Check-in Exitoso!', 'Ya estás anotado en la juntada.');
      fetchData(); // Recargar asistentes
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para validar la juntada.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setLoading(true);
        const fileName = `${juntada.id}_${Date.now()}.jpg`;
        const filePath = `${juntada.group_id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('juntadas_photos')
          .upload(filePath, decode(result.assets[0].base64), {
            contentType: 'image/jpeg',
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('juntadas_photos')
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from('juntadas')
          .update({ state: 'finalizada', photo_url: publicUrl })
          .eq('id', juntada.id);

        if (updateError) throw updateError;

        for (const attendee of attendees) {
           const { data: member } = await supabase
             .from('group_members')
             .select('points')
             .eq('group_id', juntada.group_id)
             .eq('user_id', attendee.user_id)
             .single();
             
           if (member) {
             await supabase
               .from('group_members')
               .update({ points: member.points + 3 })
               .eq('group_id', juntada.group_id)
               .eq('user_id', attendee.user_id);
           }
        }

        setPhotoUrl(publicUrl);
        setJuntadaState('finalizada');
        Alert.alert('¡Juntada Validada!', 'Se han repartido los 3 puntos base a todos los asistentes.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInjectMocks = async () => {
    Alert.alert(
      'Mocks',
      '¿Deseás inyectar 5 bots a esta juntada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, Inyectar', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase.rpc('inject_mock_users', {
              p_group_id: juntada.group_id,
              p_juntada_id: juntada.id
            });
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('¡Éxito!', 'Bots inyectados. Recargá la página.');
              fetchData();
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onLongPress={handleInjectMocks} delayLongPress={2000}>
            <Image source={require('../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{juntada.name}</Text>
        </View>
        <NeoIconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="secondary" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <NeoCard style={styles.infoCard}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.dateText}>
              Fecha: {new Date(juntada.event_date).toLocaleString()}
            </Text>
            {juntada.location ? (
              <Text style={styles.locationText}>
                Ubicación: {juntada.location}
              </Text>
            ) : null}
          </View>
          <View style={[styles.statusBadge, juntadaState === 'finalizada' && styles.statusFinished]}>
             <Text style={styles.statusText}>{juntadaState}</Text>
          </View>
        </NeoCard>

        {photoUrl && (
          <View style={styles.photoContainer}>
            <Text style={styles.sectionTitle}>EVIDENCIA FOTOGRÁFICA</Text>
            <Image source={{ uri: photoUrl }} style={styles.photo} />
          </View>
        )}

        <Text style={styles.sectionTitle}>ASISTENTES ({attendees.length})</Text>
        <NeoCard style={styles.attendeesCard}>
          {attendees.length === 0 ? (
            <Text style={styles.emptyText}>Nadie ha hecho check-in aún.</Text>
          ) : (
            attendees.map((a, i) => (
              <Text key={i} style={styles.attendeeName}>
                - {a.profiles?.username || 'Usuario'}
              </Text>
            ))
          )}
        </NeoCard>

        <View style={styles.spacer} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PARTIDAS JUGADAS</Text>
          {hasCheckedIn && juntadaState !== 'finalizada' && (
            <NeoButton 
              title="+" 
              onPress={() => {
                if (attendees.length < 3) {
                  Alert.alert('Faltan Jugadores', 'Se requieren al menos 3 personas con check-in para registrar partidas.');
                } else {
                  navigation.navigate('CreateMatch', { juntada, attendees });
                }
              }}
              variant="primary"
              style={{ paddingHorizontal: 15 }}
            />
          )}
        </View>

        {matches.length === 0 ? (
          <Text style={styles.emptyText}>No se han registrado partidas.</Text>
        ) : (
          matches.map((match, i) => {
            const winners = match.match_players?.filter((p: any) => p.is_winner).map((p: any) => p.profiles?.username).join(', ');
            return (
              <NeoCard key={i} style={styles.matchCard}>
                <Text style={styles.matchGameName}>{match.games?.name} ({match.games?.mode})</Text>
                <Text style={styles.matchWinners}>Ganador(es): {winners || 'Ninguno'}</Text>
              </NeoCard>
            )
          })
        )}

        <View style={styles.spacer} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>HERRAMIENTAS</Text>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue=""
            onValueChange={(itemValue) => {
              if (itemValue === 'randomizador') navigation.navigate('Randomizador', { juntada });
              else if (itemValue === 'bets') navigation.navigate('Bets', { juntada });
              else if (itemValue === 'votes') navigation.navigate('Votes', { juntada });
            }}
          >
            <Picker.Item label="Seleccionar herramienta..." value="" />
            <Picker.Item label="Randomizador" value="randomizador" />
            <Picker.Item label="Apuestas" value="bets" />
            <Picker.Item label="Votaciones" value="votes" />
          </Picker>
        </View>

        <View style={styles.spacer} />

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <>
            {juntadaState !== 'finalizada' && !hasCheckedIn && (
              <NeoButton title="¡LLEGUÉ! (CHECK-IN)" onPress={handleCheckIn} />
            )}
            
            {juntadaState !== 'finalizada' && isCreator && (
               <View style={{ marginTop: 16 }}>
                 <NeoButton 
                   title="TOMAR FOTO GRUPAL" 
                   onPress={handleUploadPhoto} 
                   variant="secondary"
                 />
                 <Text style={styles.helperText}>
                   Al subir la foto, la juntada finaliza y se reparten los 3 puntos base.
                 </Text>
               </View>
            )}
          </>
        )}

      </ScrollView>
      <AdBannerPlaceholder />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
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
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  locationText: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  statusFinished: {
    backgroundColor: theme.colors.secondary,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    color: theme.colors.background,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  attendeesCard: {
    padding: 16,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 3,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    marginBottom: 10
  },
  spacer: {
    height: 24,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  photoContainer: {
    marginBottom: 24,
  },
  photo: {
    width: '100%',
    height: 250,
    borderWidth: 4,
    borderColor: theme.colors.border,
    backgroundColor: '#000',
  },
  matchCard: {
    padding: 12,
    marginBottom: 8,
  },
  matchGameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  matchWinners: {
    fontSize: 14,
    color: theme.colors.text,
  }
});
