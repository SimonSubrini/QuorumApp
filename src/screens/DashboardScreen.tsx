import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { supabase } from '../lib/supabase';
import { useIsFocused } from '@react-navigation/native';

export const DashboardScreen = ({ navigation }: any) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused(); // Para recargar cuando volvemos a esta pantalla

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No estás autenticado');

      // Buscar los grupos a los que pertenece el usuario
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups ( id, name )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Mapear la respuesta ignorando los tipos estrictos de Supabase para joins
      const formattedGroups = data?.map((item: any) => ({
        id: item.groups?.id,
        name: item.groups?.name,
      })) || [];

      setGroups(formattedGroups);
    } catch (error: any) {
      Alert.alert('Error al cargar grupos', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchGroups();
    }
  }, [isFocused]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TUS GRUPOS</Text>
        <NeoButton
          title="Salir"
          onPress={handleLogout}
          variant="secondary"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {groups.length === 0 ? (
            <NeoCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No perteneces a ningún grupo todavía.</Text>
            </NeoCard>
          ) : (
            groups.map((group, index) => (
              <NeoCard key={index} style={styles.groupCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.groupName}>{group.name}</Text>
                </View>
                
                <View style={styles.spacer} />
                <NeoButton 
                  title="Entrar" 
                  onPress={() => navigation.navigate('GroupDetails', { 
                    groupId: group.id, 
                    groupName: group.name 
                  })} 
                />
              </NeoCard>
            ))
          )}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <NeoButton title="CREAR" onPress={() => navigation.navigate('CreateGroup')} />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <NeoButton title="UNIRSE" onPress={() => navigation.navigate('JoinGroup')} variant="secondary" />
          </View>
        </View>
      </View>
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Espacio para el footer fijo
  },
  groupCard: {
    padding: 20,
    marginBottom: 20,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
    flex: 1,
  },
  spacer: {
    height: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: theme.colors.background,
    borderTopWidth: 4,
    borderTopColor: theme.colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});
