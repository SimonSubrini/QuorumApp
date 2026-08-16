import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { NeoInput } from '../components/NeoInput';
import { NeoIconButton } from '../components/NeoIconButton';
import { supabase } from '../lib/supabase';
import { calculateSeasonEndDate, SeasonDuration } from '../utils/seasonLogic';
import { Picker } from '@react-native-picker/picker';
export const CreateGroupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('6_months');
  const [numWinners, setNumWinners] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Debes ingresar un nombre para el grupo');
      return;
    }

    setLoading(true);
    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No estás autenticado');

      // 1. Crear el grupo
      const startDate = new Date();
      const endDate = calculateSeasonEndDate(startDate, duration as SeasonDuration);

      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({ 
          name: name, 
          admin_id: user.id,
          end_date: endDate.toISOString(),
          num_winners: parseInt(numWinners, 10),
          season_number: 1,
          state: 'activo'
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. Agregar al creador como miembro inicial con 0 puntos
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: user.id, points: 0 });

      if (memberError) throw memberError;

      Alert.alert('Éxito', 'Grupo creado exitosamente');
      navigation.goBack(); // Volver al Dashboard

    } catch (error: any) {
      Alert.alert('Error al crear grupo', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.title} numberOfLines={1}>CREAR GRUPO</Text>
        </View>
        <NeoIconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="secondary" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <NeoCard style={styles.card}>
          <Text style={styles.description}>
            Crea un nuevo grupo para ti y tus amigos. Eres el Administrador.
          </Text>
          
          <NeoInput
            label="Nombre del Grupo"
            placeholder="Ej: Los Pibes del Fútbol"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Duración de la temporada:</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={duration} onValueChange={setDuration}>
              <Picker.Item label="1 Mes" value="1_month" />
              <Picker.Item label="6 Meses" value="6_months" />
              <Picker.Item label="1 Año" value="1_year" />
            </Picker>
          </View>

          <Text style={styles.label}>Cantidad de ganadores:</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={numWinners} onValueChange={setNumWinners}>
              <Picker.Item label="1 Ganador" value="1" />
              <Picker.Item label="Top 2" value="2" />
              <Picker.Item label="Top 3" value="3" />
            </Picker>
          </View>
          
          <View style={styles.spacer} />
          
          <View style={{ gap: 8 }}>
            <NeoButton 
              title={loading ? 'Creando...' : 'Crear Grupo'} 
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
    justifyContent: 'center',
    padding: 20,
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
    fontSize: 36,
    fontWeight: '900',
    color: theme.colors.primary,
    textTransform: 'uppercase',
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
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  pickerContainer: {
    borderWidth: 3,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    marginBottom: 10,
  }
});
