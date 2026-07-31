import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { supabase } from '../lib/supabase';
import { useIsFocused } from '@react-navigation/native';

export const GroupDetailsScreen = ({ route, navigation }: any) => {
  const { groupId, groupName } = route.params;
  const [members, setMembers] = useState<any[]>([]);
  const [juntadas, setJuntadas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ranking' | 'juntadas'>('ranking');
  const isFocused = useIsFocused();

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Cargar Miembros
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          points,
          profiles ( username, avatar_url )
        `)
        .eq('group_id', groupId)
        .order('points', { ascending: false });

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // 2. Cargar Juntadas
      const { data: juntadasData, error: juntadasError } = await supabase
        .from('juntadas')
        .select('*')
        .eq('group_id', groupId)
        .order('event_date', { ascending: false });

      if (juntadasError) throw juntadasError;
      setJuntadas(juntadasData || []);

    } catch (error: any) {
      Alert.alert('Error al cargar datos', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{groupName}</Text>
          <Text style={styles.subtitle}>ID: {groupId}</Text>
        </View>
        <NeoButton title="Volver" onPress={() => navigation.goBack()} variant="secondary" />
      </View>

      <View style={styles.tabContainer}>
        <View style={{ flex: 1, marginRight: 4 }}>
          <NeoButton 
            title="RANKING" 
            onPress={() => setActiveTab('ranking')} 
            variant={activeTab === 'ranking' ? 'primary' : 'secondary'} 
          />
        </View>
        <View style={{ flex: 1, marginLeft: 4 }}>
          <NeoButton 
            title="JUNTADAS" 
            onPress={() => setActiveTab('juntadas')} 
            variant={activeTab === 'juntadas' ? 'primary' : 'secondary'} 
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {activeTab === 'ranking' ? (
            <>
              {members.length === 0 ? (
                <Text style={styles.emptyText}>No hay miembros en este grupo aún.</Text>
              ) : (
                members.map((member, index) => (
                  <NeoCard key={index} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.rank}>#{index + 1}</Text>
                      <Text style={styles.username}>
                        {member.profiles?.username || 'Usuario Desconocido'}
                      </Text>
                    </View>
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>{member.points} pts</Text>
                    </View>
                  </NeoCard>
                ))
              )}
            </>
          ) : (
            <>
              <NeoButton 
                title="+ NUEVA JUNTADA" 
                onPress={() => navigation.navigate('CreateJuntada', { groupId, groupName })} 
              />
              <View style={styles.spacer} />
              
              {juntadas.length === 0 ? (
                <Text style={styles.emptyText}>Aún no hay juntadas planeadas.</Text>
              ) : (
                juntadas.map((juntada, index) => (
                  <NeoCard key={index} style={styles.juntadaCard}>
                    <View style={styles.juntadaHeader}>
                      <Text style={styles.juntadaName}>{juntada.name}</Text>
                      <View style={[styles.statusBadge, juntada.state === 'finalizada' && styles.statusFinished]}>
                        <Text style={styles.statusText}>{juntada.state}</Text>
                      </View>
                    </View>
                    <Text style={styles.juntadaDate}>
                      {new Date(juntada.event_date).toLocaleString()}
                    </Text>
                    <View style={styles.spacer} />
                    <NeoButton 
                      title="Ver Detalles" 
                      onPress={() => navigation.navigate('JuntadaDetails', { juntada })} 
                      variant="secondary"
                    />
                  </NeoCard>
                ))
              )}
            </>
          )}

        </ScrollView>
      )}
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
  tabContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 0,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
    marginRight: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  pointsBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  pointsText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  spacer: {
    height: 16,
  },
  juntadaCard: {
    padding: 16,
    marginBottom: 16,
  },
  juntadaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  juntadaName: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
    flex: 1,
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
    fontSize: 10,
    textTransform: 'uppercase',
    color: theme.colors.background,
  },
  juntadaDate: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: 'bold',
  }
});
