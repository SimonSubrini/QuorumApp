import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export const JuntadaDetailsScreen = ({ route, navigation }: any) => {
  const { juntada } = route.params;
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [juntadaState, setJuntadaState] = useState(juntada.state);
  const [photoUrl, setPhotoUrl] = useState(juntada.photo_url);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    const { data } = await supabase
      .from('juntada_attendees')
      .select('user_id, profiles(username)')
      .eq('juntada_id', juntada.id);
    
    setAttendees(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        base64: true, // Necesario para subir a Supabase Storage desde React Native fácilmente
      });

      if (!result.canceled && result.assets[0].base64) {
        setLoading(true);
        const fileName = `${juntada.id}_${Date.now()}.jpg`;
        const filePath = `${juntada.group_id}/${fileName}`;
        
        // Subir a Storage
        const { error: uploadError } = await supabase.storage
          .from('juntadas_photos')
          .upload(filePath, decode(result.assets[0].base64), {
            contentType: 'image/jpeg',
          });

        if (uploadError) throw uploadError;

        // Obtener URL Pública
        const { data: { publicUrl } } = supabase.storage
          .from('juntadas_photos')
          .getPublicUrl(filePath);

        // Actualizar Juntada a Finalizada y guardar foto
        const { error: updateError } = await supabase
          .from('juntadas')
          .update({ state: 'finalizada', photo_url: publicUrl })
          .eq('id', juntada.id);

        if (updateError) throw updateError;

        // Repartir 3 Puntos Base a todos los asistentes
        // Hacemos una llamada RPC o múltiples updates. Para el MVP haremos updates iterativos:
        for (const attendee of attendees) {
           // Obtener puntos actuales
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{juntada.name}</Text>
        <NeoButton title="Volver" onPress={() => navigation.goBack()} variant="secondary" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <NeoCard style={styles.infoCard}>
          <Text style={styles.dateText}>
            Fecha: {new Date(juntada.event_date).toLocaleString()}
          </Text>
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
    fontStyle: 'italic',
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
  }
});
