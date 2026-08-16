import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, KeyboardAvoidingView, Platform, Image, TouchableOpacity, PixelRatio } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { HelpModal } from '../components/HelpModal';
import { supabase } from '../lib/supabase';
import { sendPushNotifications } from '../utils/notifications';
import { NeoInput } from '../components/NeoInput';
import { Picker } from '@react-native-picker/picker';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { isVoteApproved } from '../utils/votesLogic';
import { NeoIconButton } from '../components/NeoIconButton';

export const VotesScreen = ({ route, navigation }: any) => {
  const { group, juntada } = route.params || {}; 
  // If coming from Juntada, we have both group and juntada (since juntada belongs to a group).
  // Actually Juntada params might just have juntada object. Let's make sure we get group_id.
  const groupId = group?.id || juntada?.group_id;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Crear
  const [showCreateModal, setShowCreateModal] = useState(false);
  const fontScale = PixelRatio.getFontScale();
  const isLargeFont = fontScale > 1.2;
  const [voteType, setVoteType] = useState('acto_extraordinario');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetMatchId, setTargetMatchId] = useState('');
  const [targetBetId, setTargetBetId] = useState('');
  const [pointsModifier, setPointsModifier] = useState('1');
  const [voteDesc, setVoteDesc] = useState('');
  const [ttl, setTtl] = useState('5'); // minutes

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user);

    await fetchMembers();
    if (juntada) {
      await fetchMatches();
      await fetchBets();
    }
    await fetchVotes(session?.user?.id || '');
    
    setLoading(false);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('group_members')
      .select('*, profiles(username, is_bot)')
      .eq('group_id', groupId);
    if (data) setMembers(data);
  };

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*, games(name)')
      .eq('juntada_id', juntada.id);
    if (data) setMatches(data);
  };

  const fetchBets = async () => {
    const { data } = await supabase
      .from('bets')
      .select('*, bet_options(*)')
      .eq('juntada_id', juntada.id);
    if (data) setBets(data);
  };

  const fetchVotes = async (userId: string) => {
    // If we are in juntada context, maybe fetch only juntada votes? 
    // Or fetch all group votes. Let's fetch all group votes.
    const { data: votesData } = await supabase
      .from('votes')
      .select(`
        *,
        profiles:creator_id (username),
        target_profile:target_user_id (username),
        matches:target_match_id (games(name)),
        bets:target_bet_id (id),
        vote_responses (*)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (votesData) {
      setVotes(votesData);
    }
  };

  const handleCreateVote = async () => {
    if (!voteDesc.trim()) {
      Alert.alert('Error', 'Debes ingresar una descripción o motivo.');
      return;
    }
    if (voteType === 'acto_extraordinario' && !targetUserId) {
      Alert.alert('Error', 'Selecciona un jugador afectado.');
      return;
    }
    if (voteType === 'castigo' && !targetUserId) {
      Alert.alert('Error', 'Selecciona un jugador castigado.');
      return;
    }
    if (voteType === 'anulacion_juego' && !targetMatchId) {
      Alert.alert('Error', 'Selecciona una partida a anular.');
      return;
    }
    if (voteType === 'anulacion_apuesta' && !targetBetId) {
      Alert.alert('Error', 'Selecciona una apuesta a anular.');
      return;
    }

    setLoading(true);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(ttl, 10));

    const { error } = await supabase
      .from('votes')
      .insert({
        group_id: groupId,
        juntada_id: juntada ? juntada.id : null,
        creator_id: currentUser.id,
        type: voteType,
        target_user_id: (voteType === 'acto_extraordinario' || voteType === 'castigo') ? targetUserId : null,
        target_match_id: voteType === 'anulacion_juego' ? targetMatchId : null,
        target_bet_id: voteType === 'anulacion_apuesta' ? targetBetId : null,
        points_modifier: (voteType === 'acto_extraordinario' || voteType === 'castigo') ? parseFloat(pointsModifier) : null,
        description: voteDesc,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // Send Push Notifications
      try {
        let tokens: string[] = [];
        if (juntada) {
          // Si es votación de juntada, notificar solo a los que hicieron check-in
          const { data: participantsData } = await supabase
            .from('participants')
            .select(`
              user_id,
              profiles!inner(expo_push_token, is_bot)
            `)
            .eq('juntada_id', juntada.id)
            .neq('user_id', currentUser.id)
            .eq('profiles.is_bot', false)
            .not('profiles.expo_push_token', 'is', null);
            
          if (participantsData) {
            tokens = participantsData.map((p: any) => p.profiles.expo_push_token).filter(Boolean);
          }
        } else {
          // Si es de grupo, notificar a todos los miembros del grupo
          const { data: groupMembersData } = await supabase
            .from('group_members')
            .select(`
              user_id,
              profiles!inner(expo_push_token, is_bot)
            `)
            .eq('group_id', groupId)
            .neq('user_id', currentUser.id)
            .eq('profiles.is_bot', false)
            .not('profiles.expo_push_token', 'is', null);
            
          if (groupMembersData) {
            tokens = groupMembersData.map((m: any) => m.profiles.expo_push_token).filter(Boolean);
          }
        }

        if (tokens.length > 0) {
          await sendPushNotifications(
            tokens,
            'Nueva Votación',
            `Se ha creado una nueva votación: "${voteDesc}". ¡Ingresá para votar!`,
            { groupId, juntadaId: juntada ? juntada.id : null, type: 'new_vote' }
          );
        }
      } catch (pushError) {
        console.error('Error sending push for vote', pushError);
      }

      setShowCreateModal(false);
      setVoteDesc('');
      await fetchVotes(currentUser.id);
    }
    setLoading(false);
  };

  const castVote = async (voteId: string, response: boolean) => {
    setLoading(true);
    const { error } = await supabase
      .from('vote_responses')
      .insert({
        vote_id: voteId,
        user_id: currentUser.id,
        response: response
      });
    
    if (error) {
      Alert.alert('Error', error.message);
    }
    await fetchVotes(currentUser.id);
    setLoading(false);
  };

  const resolveVote = async (vote: any) => {
    setLoading(true);
    const responses = vote.vote_responses;
    const yesCount = responses.filter((r:any) => r.response === true).length;
    const realMembersCount = members.filter((m:any) => m.profiles?.is_bot !== true).length;
    const totalMembers = realMembersCount > 0 ? realMembersCount : members.length;
    
    const isApproved = isVoteApproved(yesCount, totalMembers);
    
    if (isApproved) {
      if (vote.type === 'acto_extraordinario' || vote.type === 'castigo') {
        const member = members.find(m => m.user_id === vote.target_user_id);
        if (member) {
          const newPoints = Math.max(0, Number(member.points) + Number(vote.points_modifier));
          await supabase.from('group_members').update({ points: newPoints }).eq('id', member.id);
        }
      } else if (vote.type === 'anulacion_juego') {
        // Buscar participantes de la partida y revertir sus puntos
        const { data: matchPlayers } = await supabase
          .from('match_players')
          .select('*')
          .eq('match_id', vote.target_match_id);
        
        if (matchPlayers) {
          for (let mp of matchPlayers) {
            if (mp.points_earned !== 0) {
              const m = members.find(m => m.user_id === mp.user_id);
              if (m) {
                const newPoints = Math.max(0, Number(m.points) - Number(mp.points_earned));
                await supabase.from('group_members').update({ points: newPoints }).eq('id', m.id);
              }
            }
          }
          // Borrar la partida
          await supabase.from('matches').delete().eq('id', vote.target_match_id);
        }
      } else if (vote.type === 'anulacion_apuesta') {
        const { data: betParticipants } = await supabase
          .from('bet_participants')
          .select('*')
          .eq('bet_id', vote.target_bet_id);
        
        if (betParticipants) {
          for (let bp of betParticipants) {
            if (bp.points_won !== 0) {
              const m = members.find(m => m.user_id === bp.user_id);
              if (m) {
                const newPoints = Math.max(0, Number(m.points) - Number(bp.points_won));
                await supabase.from('group_members').update({ points: newPoints }).eq('id', m.id);
              }
            }
          }
          // Borrar la apuesta
          await supabase.from('bets').delete().eq('id', vote.target_bet_id);
        }
      }
    }

    await supabase
      .from('votes')
      .update({ status: isApproved ? 'aprobada' : 'rechazada' })
      .eq('id', vote.id);

    await loadInitialData();
    setLoading(false);
  };

  const renderVoteCard = (vote: any) => {
    const isExpired = new Date(vote.expires_at) < new Date();
    const hasVoted = vote.vote_responses.some((r:any) => r.user_id === currentUser?.id);
    const yesCount = vote.vote_responses.filter((r:any) => r.response === true).length;
    const noCount = vote.vote_responses.filter((r:any) => r.response === false).length;

    return (
      <NeoCard key={vote.id} style={styles.voteCard}>
        <View style={[styles.voteHeader, { flexDirection: isLargeFont ? 'column' : 'row', alignItems: isLargeFont ? 'flex-start' : 'center', gap: isLargeFont ? 8 : 0 }]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {vote.type === 'acto_extraordinario' ? 'ACTO EXTRAORD.' : 
               vote.type === 'castigo' ? 'CASTIGO' : 
               vote.type === 'anulacion_juego' ? 'ANULAR PARTIDA' : 'ANULAR APUESTA'}
            </Text>
          </View>
          <Text style={[styles.statusText, { color: vote.status === 'activa' ? theme.colors.primary : theme.colors.secondary }]}>
            {vote.status.toUpperCase()}
          </Text>
        </View>
        
        <Text style={styles.voteDesc}>{vote.description}</Text>
        
        {(vote.type === 'acto_extraordinario' || vote.type === 'castigo') && (
          <Text style={styles.voteTarget}>Usuario afectado: {vote.target_profile?.username} ({vote.points_modifier > 0 ? '+' : ''}{vote.points_modifier} pts)</Text>
        )}
        {vote.type === 'anulacion_juego' && (
          <Text style={styles.voteTarget}>Partida a anular: {vote.matches?.games?.name}</Text>
        )}
        {vote.type === 'anulacion_apuesta' && (
          <Text style={styles.voteTarget}>Apuesta a anular: ID {vote.target_bet_id}</Text>
        )}

        <Text style={styles.voteAuthor}>Propuesto por: {vote.profiles?.username}</Text>
        
        {vote.status === 'activa' && !isExpired && (
          <Text style={styles.expiresText}>
            Expira: {new Date(vote.expires_at).toLocaleTimeString()}
          </Text>
        )}

        {vote.status === 'activa' ? (
          <>
            <View style={[styles.resultsBar, isLargeFont && { flexDirection: 'column' }]}>
              <Text style={styles.resultText}>Sí: {yesCount}</Text>
              <Text style={styles.resultText}>No: {noCount}</Text>
            </View>
            
            {isExpired ? (
              <NeoButton 
                title="EJECUTAR RESULTADO" 
                onPress={() => resolveVote(vote)} 
                variant="secondary"
                style={{ marginTop: 15 }}
              />
            ) : !hasVoted ? (
              <View style={styles.voteActions}>
                <View style={{ flexDirection: isLargeFont ? 'column' : 'row', gap: 10, marginTop: 10 }}>
                  <NeoButton title="VOTAR SÍ" onPress={() => castVote(vote.id, true)} style={{ flex: isLargeFont ? 0 : 1 }} />
                  <NeoButton title="VOTAR NO" onPress={() => castVote(vote.id, false)} variant="secondary" style={{ flex: isLargeFont ? 0 : 1 }} />
                </View>
              </View>
            ) : (
              <Text style={styles.votedText}>Ya emitiste tu voto.</Text>
            )}
          </>
        ) : (
          <View style={styles.resultsBar}>
            <Text style={styles.resultText}>Resultado Final:{isLargeFont ? '\n' : ' '}{yesCount} Sí, {noCount} No</Text>
          </View>
        )}
      </NeoCard>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.title} maxFontSizeMultiplier={1.2} adjustsFontSizeToFit>{juntada ? juntada.name : 'VOTACIONES'}</Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.2}>{juntada ? 'De Juntada' : 'De Grupo'}</Text>
          </View>
        </View>
        <NeoIconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="secondary" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <NeoButton 
          title="+ NUEVA VOTACIÓN" 
          onPress={() => setShowCreateModal(true)} 
          style={{ marginBottom: 20 }}
        />
        
        {votes.map(renderVoteCard)}
        {votes.length === 0 && <Text style={styles.emptyText}>No hay votaciones activas en este grupo.</Text>}
      </ScrollView>

      {/* Modal Crear */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <ScrollView>
            <NeoCard style={styles.modalCard}>
              <Text style={styles.modalTitle}>NUEVA VOTACIÓN</Text>
              
              <Text style={styles.label}>Tipo de votación:</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={voteType} onValueChange={(v) => {
                  setVoteType(v);
                  if (v === 'acto_extraordinario') setPointsModifier('1');
                  else if (v === 'castigo') setPointsModifier('-1');
                }}>
                  <Picker.Item label="Acto Extraordinario" value="acto_extraordinario" />
                  <Picker.Item label="Castigo" value="castigo" />
                  {juntada && <Picker.Item label="Anular Partida" value="anulacion_juego" />}
                  {juntada && <Picker.Item label="Anular Apuesta" value="anulacion_apuesta" />}
                </Picker>
              </View>

              {(voteType === 'acto_extraordinario' || voteType === 'castigo') && (
                <>
                  <Text style={styles.label}>Puntos ({voteType === 'acto_extraordinario' ? '+' : '-'}):</Text>
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={pointsModifier} onValueChange={setPointsModifier}>
                      {voteType === 'acto_extraordinario' 
                        ? [1, 2, 3].map(val => (
                            <Picker.Item key={val} label={`+${val}`} value={String(val)} />
                          ))
                        : [-1, -2, -3].map(val => (
                            <Picker.Item key={val} label={`${val}`} value={String(val)} />
                          ))
                      }
                    </Picker>
                  </View>

                  <Text style={styles.label}>Usuario afectado:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={targetUserId} onValueChange={setTargetUserId}>
                      <Picker.Item label="-- Seleccionar --" value="" />
                      {members.map(m => (
                        <Picker.Item key={m.user_id} label={m.profiles.username} value={m.user_id} />
                      ))}
                    </Picker>
                  </View>
                </>
              )}

              {voteType === 'anulacion_juego' && juntada && (
                <>
                  <Text style={styles.label}>Partida a anular:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={targetMatchId} onValueChange={setTargetMatchId}>
                      <Picker.Item label="-- Seleccionar --" value="" />
                      {matches.map(m => (
                        <Picker.Item key={m.id} label={`${m.games?.name} (${new Date(m.created_at).toLocaleTimeString()})`} value={m.id} />
                      ))}
                    </Picker>
                  </View>
                </>
              )}

              {voteType === 'anulacion_apuesta' && juntada && (
                <>
                  <Text style={styles.label}>Apuesta a anular:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={targetBetId} onValueChange={setTargetBetId}>
                      <Picker.Item label="-- Seleccionar --" value="" />
                      {bets.map(b => (
                        <Picker.Item key={b.id} label={`${b.title} (${new Date(b.created_at).toLocaleTimeString()})`} value={b.id} />
                      ))}
                    </Picker>
                  </View>
                </>
              )}

              <NeoInput 
                label="Motivo / Descripción" 
                value={voteDesc} 
                onChangeText={setVoteDesc} 
                placeholder="Ej: Trampa en metegol / Trajo asado"
              />

              <Text style={styles.label}>Tiempo Límite de votación:</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={ttl} onValueChange={setTtl}>
                  <Picker.Item label="1 Minuto" value="1" />
                  <Picker.Item label="5 Minutos" value="5" />
                  <Picker.Item label="10 Minutos" value="10" />
                  <Picker.Item label="30 Minutos" value="30" />
                  <Picker.Item label="1 Hora" value="60" />
                </Picker>
              </View>

              <View style={{ flexDirection: isLargeFont ? 'column' : 'row', gap: 10, marginTop: 20 }}>
                <NeoButton title="Cancelar" onPress={() => setShowCreateModal(false)} variant="secondary" style={{ flex: isLargeFont ? 0 : 1 }} />
                <NeoButton title="Crear" onPress={handleCreateVote} style={{ flex: isLargeFont ? 0 : 1 }} />
              </View>
            </NeoCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <AdBannerPlaceholder />
    </View>
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
  title: { fontSize: 20, fontWeight: '900', color: theme.colors.primary, textTransform: 'uppercase' },
  subtitle: { fontSize: 12, color: theme.colors.text, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  voteCard: { padding: 20, marginBottom: 15 },
  voteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 2 },
  badgeText: { color: theme.colors.background, fontWeight: 'bold', fontSize: 12 },
  statusText: { fontWeight: '900', fontSize: 14 },
  voteDesc: { fontSize: 18, fontWeight: '900', marginBottom: 10 },
  voteTarget: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  voteAuthor: { fontSize: 14, color: '#555', marginBottom: 5 },
  expiresText: { fontSize: 14, color: theme.colors.secondary, fontWeight: 'bold', marginBottom: 10 },
  resultsBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, padding: 10, backgroundColor: '#eee', borderWidth: 2 },
  resultText: { fontWeight: 'bold', fontSize: 16 },
  voteActions: { flexDirection: 'row', marginTop: 15 },
  votedText: { textAlign: 'center', fontWeight: 'bold', color: theme.colors.primary, marginTop: 15 },
  emptyText: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginTop: 20 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
  pickerContainer: { borderWidth: 3, borderColor: theme.colors.border, backgroundColor: theme.colors.background, marginBottom: 10 }
});
