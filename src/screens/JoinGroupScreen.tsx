import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { NeoInput } from '../components/NeoInput';
import { NeoIconButton } from '../components/NeoIconButton';
import { supabase } from '../lib/supabase';

export const JoinGroupScreen = ({ navigation }: any) => {
  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!groupId.trim()) {
      Alert.alert('Error', 'Debes ingresar un Código de Grupo');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No estás autenticado');

      // Validar si el grupo existe
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id, name')
        .eq('id', groupId.trim())
        .single();

      if (groupError || !group) {
        throw new Error('Grupo no encontrado. Verifica el código.');
      }

      // Unirse al grupo
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: user.id, points: 0 });

      if (memberError) {
        if (memberError.code === '23505') { // Unique violation
            throw new Error('Ya perteneces a este grupo.');
        }
        throw memberError;
      }

      Alert.alert('¡Bienvenido!', `Te has unido exitosamente al grupo: ${group.name}`);
      navigation.goBack();

    } catch (error: any) {
      Alert.alert('Error al unirse', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require('../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.title} numberOfLines={1}>UNIRSE A GRUPO</Text>
          </View>
          <NeoIconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="secondary" />
        </View>

        <NeoCard style={styles.card}>
          <Text style={styles.description}>
            Ingresa el Código Único (ID) del grupo que te pasó el Administrador.
          </Text>
          
          <NeoInput
            label="Código del Grupo"
            placeholder="Ej: 123e4567-e89b-12d3..."
            value={groupId}
            onChangeText={setGroupId}
            autoCapitalize="none"
          />
          
          <View style={styles.spacer} />
          
          <NeoButton 
            title={loading ? 'Buscando...' : 'Unirse'} 
            onPress={handleJoin} 
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
    fontSize: 32,
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
