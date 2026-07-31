import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { NeoInput } from '../components/NeoInput';
import { supabase } from '../lib/supabase';

export const CreateGroupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
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
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({ name: name, admin_id: user.id })
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>NUEVO GRUPO</Text>
        </View>

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
          
          <View style={styles.spacer} />
          
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
  }
});
