import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { NeoInput } from '../components/NeoInput';
import { supabase } from '../lib/supabase';

export const CreateJuntadaScreen = ({ route, navigation }: any) => {
  const { groupId, groupName } = route.params;
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Error', 'Debes completar todos los campos');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No estás autenticado');

      // Validar formato básico de fecha (YYYY-MM-DD) y hora (HH:MM)
      // En una app real usaríamos un DatePicker nativo
      const eventDate = new Date(`${date}T${time}:00`);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Formato de fecha u hora inválido. Usa YYYY-MM-DD y HH:MM');
      }

      const { error } = await supabase
        .from('juntadas')
        .insert({ 
          group_id: groupId, 
          name: name, 
          event_date: eventDate.toISOString(),
          created_by: user.id
        });

      if (error) throw error;

      Alert.alert('Éxito', 'Juntada agendada correctamente');
      navigation.goBack();

    } catch (error: any) {
      Alert.alert('Error al agendar', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>AGENDAR JUNTADA</Text>
          <Text style={styles.subtitle}>Grupo: {groupName}</Text>
        </View>

        <NeoCard style={styles.card}>
          <Text style={styles.description}>
            Cualquier miembro del grupo puede proponer y crear un evento.
          </Text>
          
          <NeoInput
            label="Motivo / Nombre"
            placeholder="Ej: Asado del viernes"
            value={name}
            onChangeText={setName}
          />

          <NeoInput
            label="Fecha (YYYY-MM-DD)"
            placeholder="Ej: 2026-12-31"
            value={date}
            onChangeText={setDate}
          />

          <NeoInput
            label="Hora (HH:MM)"
            placeholder="Ej: 21:30"
            value={time}
            onChangeText={setTime}
          />
          
          <View style={styles.spacer} />
          
          <NeoButton 
            title={loading ? 'Agendando...' : 'Confirmar'} 
            onPress={handleCreate} 
            disabled={loading}
          />
          
          <NeoButton 
            title="Cancelar" 
            onPress={() => navigation.goBack()} 
            variant="secondary"
          />
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
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  card: {
    padding: 24,
  },
  spacer: {
    height: 16,
  }
});
