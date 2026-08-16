import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, PixelRatio, Image } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { NeoIconButton } from '../components/NeoIconButton';
import { supabase } from '../lib/supabase';
import { useIsFocused } from '@react-navigation/native';
import { getAvatarSource } from '../utils/avatars';

export const GroupDetailsScreen = ({ route, navigation }: any) => {
  const { groupId, groupName } = route.params;
  const [members, setMembers] = useState<any[]>([]);
  const [juntadas, setJuntadas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ranking' | 'juntadas'>('ranking');
  const [group, setGroup] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isFocused = useIsFocused();

  const fontScale = PixelRatio.getFontScale();
  const isLargeFont = fontScale > 1.2;

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: groupData } = await supabase.from('groups').select('*').eq('id', groupId).single();
      setGroup(groupData);

      // 1. Cargar Miembros
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          user_id,
          points,
          profiles ( id, username, avatar_url )
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

  const handleEndSeason = async () => {
    try {
      setLoading(true);
      // Obtener el top X ganadores
      const topWinners = members.slice(0, group.num_winners || 1).map((m: any, index: number) => ({
        rank: index + 1,
        user_id: m.user_id,
        username: m.profiles?.username,
        points: m.points
      }));

      const { error } = await supabase
        .from('groups')
        .update({
          state: 'finalizado',
          winners_data: topWinners
        })
        .eq('id', groupId);

      if (error) throw error;
      await fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSeason = async () => {
    try {
      setLoading(true);
      // Crear nuevo grupo
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6); // default 6 months

      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: group.name,
          admin_id: group.admin_id,
          end_date: endDate.toISOString(),
          num_winners: group.num_winners,
          season_number: (group.season_number || 1) + 1,
          state: 'activo'
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const newMembers = members.map(m => ({
        group_id: newGroup.id,
        user_id: m.user_id,
        points: 0
      }));

      const { error: insertError } = await supabase.from('group_members').insert(newMembers);
      if (insertError) throw insertError;

      Alert.alert('Éxito', 'Nueva temporada creada con éxito.');
      navigation.navigate('Dashboard');
    } catch (e: any) {
      Alert.alert('Error', e.message);
      setLoading(false);
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Abandonar Grupo',
      '¿Estás seguro que deseas abandonar el grupo? Perderás todos tus puntos y ya no tendrás acceso al mismo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abandonar',
          style: 'destructive',
          onPress: async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
              const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', groupId)
                .eq('user_id', currentUser.id);
              if (error) throw error;
              navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
            } catch (e: any) {
              Alert.alert('Error', e.message);
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const isEnded = group?.end_date && new Date(group.end_date) < new Date();
  const isAdmin = currentUser?.id === group?.admin_id;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NeoIconButton
            icon="log-out-outline"
            onPress={handleLeaveGroup}
            variant="secondary"
            style={{ marginRight: 12 }}
          />
          <Image source={require('../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.title} maxFontSizeMultiplier={1.2} adjustsFontSizeToFit>{groupName} {group?.season_number ? `(S${group.season_number})` : ''}</Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.2}>ID: {groupId}</Text>
            {group?.end_date && (
              <Text style={styles.dateText} maxFontSizeMultiplier={1.2}>
                Vence: {new Date(group.end_date).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
        <NeoIconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="secondary" />
      </View>

      <View style={{ padding: 20, paddingBottom: 0, gap: 8 }}>
        <View style={{ flexDirection: isLargeFont ? 'column' : 'row', gap: 8 }}>
          <View style={{ flex: isLargeFont ? 0 : 1 }}>
            <NeoButton
              title={group?.state === 'finalizado' ? 'CEREMONIA' : 'RANKING'}
              onPress={() => setActiveTab('ranking')}
              variant={activeTab === 'ranking' ? 'primary' : 'secondary'}
              style={{ height: '100%' }}
            />
          </View>
          <View style={{ flex: isLargeFont ? 0 : 1 }}>
            <NeoButton
              title="JUNTADAS"
              onPress={() => setActiveTab('juntadas')}
              variant={activeTab === 'juntadas' ? 'primary' : 'secondary'}
              style={{ height: '100%' }}
            />
          </View>
        </View>
        <NeoButton
          title="VOTACIONES"
          onPress={() => navigation.navigate('Votes', { group: { id: groupId, name: groupName } })}
          variant="secondary"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {activeTab === 'ranking' ? (
            <>
              {group?.state === 'finalizado' ? (
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.ceremonyTitle}>¡TEMPORADA FINALIZADA!</Text>
                  <Text style={styles.ceremonySubtitle}>Felicitaciones a los ganadores:</Text>
                  {group?.winners_data?.map((w: any, index: number) => (
                    <NeoCard key={index} style={[styles.memberCard, { backgroundColor: index === 0 ? theme.colors.primary : theme.colors.background }]}>
                      <View style={styles.memberInfo}>
                        <Text style={[styles.rank, { color: index === 0 ? theme.colors.background : theme.colors.primary }]}>#{w.rank}</Text>
                        <Text style={[styles.username, { color: index === 0 ? theme.colors.background : theme.colors.text }]}>
                          {w.username}
                          {w.user_id === group?.admin_id ? ' ⭐' : ''}
                        </Text>
                      </View>
                      <View style={[styles.pointsBadge, { backgroundColor: index === 0 ? theme.colors.background : theme.colors.secondary }]}>
                        <Text style={[styles.pointsText, { color: index === 0 ? theme.colors.text : theme.colors.text }]}>{w.points} pts</Text>
                      </View>
                    </NeoCard>
                  ))}

                  {isAdmin && (
                    <NeoButton
                      title="Iniciar Nueva Temporada"
                      onPress={handleNewSeason}
                      style={{ marginTop: 20, width: '100%' }}
                    />
                  )}
                </View>
              ) : (
                <>
                  {isEnded && isAdmin && (
                    <View style={{ marginBottom: 20 }}>
                      <NeoCard style={{ backgroundColor: theme.colors.secondary, padding: 15, alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
                          Esta temporada ha finalizado. Finaliza el grupo para coronar a los ganadores.
                        </Text>
                        <NeoButton title="Finalizar Temporada" onPress={handleEndSeason} />
                      </NeoCard>
                    </View>
                  )}
                  {members.length === 0 ? (
                    <Text style={styles.emptyText}>No hay miembros en este grupo aún.</Text>
                  ) : (
                    <View>
                      {/* PODIUM */}
                      <View style={styles.podiumContainer}>
                        {/* Puesto 2 */}
                        {members[1] && (
                          <View style={[styles.podiumItem, styles.podiumSecond]}>
                            <View style={[styles.podiumAvatarContainer, { width: 50, height: 50 }]}>
                              {members[1].profiles?.avatar_url ? (
                                <Image source={getAvatarSource(members[1].profiles.avatar_url)!} style={styles.podiumAvatar} />
                              ) : (
                                <Text style={styles.podiumAvatarFallback}>{members[1].profiles?.username?.charAt(0).toUpperCase()}</Text>
                              )}
                            </View>
                            <Text style={styles.podiumName} numberOfLines={1}>{members[1].profiles?.username}</Text>
                            <View style={[styles.podiumBase, { height: 100, backgroundColor: '#C0C0C0' }]}>
                              <Text style={styles.podiumRankText}>2</Text>
                              <Text style={styles.podiumPointsText}>{members[1].points} pts</Text>
                            </View>
                          </View>
                        )}
                        {/* Puesto 1 */}
                        {members[0] && (
                          <View style={[styles.podiumItem, styles.podiumFirst]}>
                            <View style={[styles.podiumAvatarContainer, { width: 70, height: 70 }]}>
                              {members[0].profiles?.avatar_url ? (
                                <Image source={getAvatarSource(members[0].profiles.avatar_url)!} style={styles.podiumAvatar} />
                              ) : (
                                <Text style={styles.podiumAvatarFallback}>{members[0].profiles?.username?.charAt(0).toUpperCase()}</Text>
                              )}
                            </View>
                            <Text style={styles.podiumName} numberOfLines={1}>{members[0].profiles?.username}</Text>
                            <View style={[styles.podiumBase, { height: 140, backgroundColor: '#FFD700' }]}>
                              <Text style={styles.podiumRankText}>1</Text>
                              <Text style={styles.podiumPointsText}>{members[0].points} pts</Text>
                            </View>
                          </View>
                        )}
                        {/* Puesto 3 */}
                        {members[2] && (
                          <View style={[styles.podiumItem, styles.podiumThird]}>
                            <View style={[styles.podiumAvatarContainer, { width: 50, height: 50 }]}>
                              {members[2].profiles?.avatar_url ? (
                                <Image source={getAvatarSource(members[2].profiles.avatar_url)!} style={styles.podiumAvatar} />
                              ) : (
                                <Text style={styles.podiumAvatarFallback}>{members[2].profiles?.username?.charAt(0).toUpperCase()}</Text>
                              )}
                            </View>
                            <Text style={styles.podiumName} numberOfLines={1}>{members[2].profiles?.username}</Text>
                            <View style={[styles.podiumBase, { height: 75, backgroundColor: '#CD7F32' }]}>
                              <Text style={styles.podiumRankText}>3</Text>
                              <Text style={styles.podiumPointsText}>{members[2].points} pts</Text>
                            </View>
                          </View>
                        )}
                      </View>

                      {/* RESTO DE LA LISTA */}
                      {members.slice(3).map((member, index) => (
                        <NeoCard key={index} style={styles.memberCard}>
                          <View style={styles.memberInfo}>
                            <Text style={styles.rank}>#{index + 4}</Text>
                            <View style={styles.listAvatarContainer}>
                              {member.profiles?.avatar_url ? (
                                <Image source={getAvatarSource(member.profiles.avatar_url)!} style={styles.listAvatar} />
                              ) : (
                                <Text style={styles.listAvatarFallback}>{member.profiles?.username?.charAt(0).toUpperCase()}</Text>
                              )}
                            </View>
                            <Text style={styles.username}>
                              {member.profiles?.username || 'Usuario Desconocido'}
                              {member.user_id === group?.admin_id ? ' ⭐' : ''}
                            </Text>
                          </View>
                          <View style={styles.pointsBadge}>
                            <Text style={styles.pointsText}>{member.points} pts</Text>
                          </View>
                        </NeoCard>
                      ))}
                    </View>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {(!isEnded && group?.state !== 'finalizado') && (
                <NeoButton
                  title="+ NUEVA JUNTADA"
                  onPress={() => navigation.navigate('CreateJuntada', { groupId, groupName })}
                />
              )}
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
  tabContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 0,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
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
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    flexShrink: 1,
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
  },
  dateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginTop: 2,
  },
  ceremonyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center'
  },
  ceremonySubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center'
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 30,
    marginTop: 20,
    height: 250,
  },
  podiumItem: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  podiumFirst: {
    zIndex: 2,
  },
  podiumSecond: {
    zIndex: 1,
  },
  podiumThird: {
    zIndex: 1,
  },
  podiumAvatarContainer: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  podiumAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  podiumAvatarFallback: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
    maxWidth: 80,
    textAlign: 'center',
  },
  podiumBase: {
    width: 80,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
  },
  podiumRankText: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
  },
  podiumPointsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  listAvatarContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  listAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  listAvatarFallback: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  }
});
