import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { NeoInput } from '../components/NeoInput';
import { supabase } from '../lib/supabase';
import { Picker } from '@react-native-picker/picker';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { canUserBet, distributeBetPoints } from '../utils/betsLogic';
import { NeoIconButton } from '../components/NeoIconButton';

export const BetsScreen = ({ route, navigation }: any) => {
  const { juntada } = route.params;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentMember, setCurrentMember] = useState<any>(null);
  
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Totales apostados por el usuario actual en esta juntada
  const [userBetTotal, setUserBetTotal] = useState(0);

  // Modal Crear
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBetAmount, setNewBetAmount] = useState('1');
  const [newBetIsMulti, setNewBetIsMulti] = useState(true);
  const [newBetDesc, setNewBetDesc] = useState('');
  const [newBetOptions, setNewBetOptions] = useState<string[]>(['Sí', 'No']);
  // Modal Resolver
  const [resolvingBet, setResolvingBet] = useState<any>(null);
  const [winnerOptionId, setWinnerOptionId] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user);

    // Get current user member points
    const { data: memberData } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', juntada.group_id)
      .eq('user_id', session?.user.id)
      .single();
    
    setCurrentMember(memberData);

    await fetchBets(session?.user?.id || '');
    setLoading(false);
  };

  const fetchBets = async (userId: string) => {
    const { data: betsData, error } = await supabase
      .from('bets')
      .select(`
        *,
        profiles:creator_id (username, is_bot),
        bet_options!bet_options_bet_id_fkey (*),
        bet_participants (*, profiles(username, is_bot))
      `)
      .eq('juntada_id', juntada.id)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error fetching bets', error.message);
    }

    if (betsData) {
      setBets(betsData);
      
      // Calculate how many points the current user has already bet
      let total = 0;
      betsData.forEach(b => {
        if (b.status === 'abierta') {
          const participated = b.bet_participants.find((p:any) => p.user_id === userId);
          if (participated) {
            total += Number(b.amount);
          }
        }
      });
      setUserBetTotal(total);
    }
  };

  const handleCreateBet = async () => {
    const validOptions = newBetOptions.map(o => o.trim()).filter(o => o.length > 0);
    if (!newBetDesc.trim() || validOptions.length < 2) {
      Alert.alert('Error', 'Completa la descripción y al menos 2 opciones válidas.');
      return;
    }
    const amount = Number(newBetAmount);
    if (userBetTotal + amount > 3) {
      Alert.alert('Límite excedido', 'No puedes apostar más de 3 puntos en total por juntada.');
      return;
    }
    if (currentMember.points < amount) {
      Alert.alert('Saldo insuficiente', 'No tienes suficientes puntos en el grupo.');
      return;
    }

    setLoading(true);
    // 1. Crear apuesta
    const { data: betData, error: betError } = await supabase
      .from('bets')
      .insert({
        juntada_id: juntada.id,
        creator_id: currentUser.id,
        amount: amount,
        is_multiplayer: newBetIsMulti,
        description: newBetDesc,
      })
      .select()
      .single();

    if (betError || !betData) {
      Alert.alert('Error', betError?.message);
      setLoading(false);
      return;
    }

    // 2. Crear opciones
    // 2. Crear opciones
    for (const optDesc of validOptions) {
      await supabase.from('bet_options').insert({ bet_id: betData.id, description: optDesc });
    }

    // Lógica para bots
    const { data: createdOptions } = await supabase.from('bet_options').select('*').eq('bet_id', betData.id);
    if (createdOptions && createdOptions.length > 0) {
      const { data: groupMembers } = await supabase
        .from('group_members')
        .select('*, profiles(username, is_bot)')
        .eq('group_id', juntada.group_id);

      if (groupMembers) {
        const bots = groupMembers.filter((m:any) => m.profiles?.is_bot === true);
        if (bots.length > 0) {
          if (newBetIsMulti) {
            for (const bot of bots) {
              const randomOpt = createdOptions[Math.floor(Math.random() * createdOptions.length)];
              await supabase.from('bet_participants').insert({
                bet_id: betData.id,
                user_id: bot.user_id,
                option_id: randomOpt.id
              });
            }
          } else {
            const randomBot = bots[Math.floor(Math.random() * bots.length)];
            const randomOpt = createdOptions[Math.floor(Math.random() * createdOptions.length)];
            await supabase.from('bet_participants').insert({
              bet_id: betData.id,
              user_id: randomBot.user_id,
              option_id: randomOpt.id
            });
          }
        }
      }
    }
    
    setShowCreateModal(false);
    setNewBetDesc('');
    setNewBetOptions(['Sí', 'No']);
    await fetchBets(currentUser.id);
    setLoading(false);
  };

  const joinBet = async (bet: any, optionId: string) => {
    const amount = Number(bet.amount);
    if (!canUserBet(userBetTotal, amount)) {
      Alert.alert('Límite excedido', 'No puedes apostar más de 3 puntos en total por juntada.');
      return;
    }
    if (currentMember.points < amount) {
      Alert.alert('Saldo insuficiente', 'No tienes suficientes puntos.');
      return;
    }
    if (!bet.is_multiplayer && bet.bet_participants.length >= 2) {
      Alert.alert('Apuesta llena', 'Esta apuesta es solo para 2 participantes.');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('bet_participants')
      .insert({
        bet_id: bet.id,
        user_id: currentUser.id,
        option_id: optionId
      });

    if (error) {
      Alert.alert('Error', error.message);
    }
    await fetchBets(currentUser.id);
    setLoading(false);
  };

  const resolveBet = async () => {
    if (!resolvingBet || !winnerOptionId) return;
    setLoading(true);

    const amount = Number(resolvingBet.amount);
    const participants = resolvingBet.bet_participants;
    const totalPool = amount * participants.length;
    
    const winners = participants.filter((p:any) => p.option_id === winnerOptionId);
    
    if (winners.length === 0) {
      // Nadie ganó, devolvemos el dinero o la banca gana. MVP: Se devuelve o nadie gana (Neto = 0).
      // Mejor: actualizamos apuesta a resuelta y ya, todos pierden o nadie gana.
      // Para simplificar, si nadie acertó, nadie gana nada, pierden lo apostado.
    }

    const prizeRounded = distributeBetPoints(totalPool, winners.length);

    for (let p of participants) {
      const isWinner = p.option_id === winnerOptionId;
      const netChange = isWinner ? (prizeRounded - amount) : -amount;

      // Actualizar puntos de group_members
      const { data: member } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', juntada.group_id)
        .eq('user_id', p.user_id)
        .single();
      
      if (member) {
        const newPoints = Math.round((Number(member.points) + netChange) * 10) / 10;
        await supabase
          .from('group_members')
          .update({ points: newPoints })
          .eq('id', member.id);
      }

      // Actualizar points_won en participante
      if (isWinner) {
        await supabase
          .from('bet_participants')
          .update({ points_won: prizeRounded })
          .eq('id', p.id);
      }
    }

    // Marcar resuelta
    await supabase
      .from('bets')
      .update({ status: 'resuelta', winner_option_id: winnerOptionId })
      .eq('id', resolvingBet.id);

    setResolvingBet(null);
    setWinnerOptionId('');
    await loadInitialData(); // reload points and bets
    setLoading(false);
  };

  const renderBetCard = (bet: any) => {
    const isCreator = bet.creator_id === currentUser?.id;
    const isAdmin = juntada.admin_id === currentUser?.id; // juntada doesn't have admin_id directly, groups does. Assuming we don't strict check admin here for MVP or just allow creator.
    const hasJoined = bet.bet_participants.some((p:any) => p.user_id === currentUser?.id);
    const isFull = !bet.is_multiplayer && bet.bet_participants.length >= 2;

    return (
      <NeoCard key={bet.id} style={styles.betCard}>
        <View style={styles.betHeader}>
          <Text style={styles.betDesc}>{bet.description}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{bet.amount} PTS</Text>
          </View>
        </View>
        <Text style={styles.betSub}>Por: {bet.profiles?.username}</Text>
        <Text style={styles.betSub}>Participantes: {bet.bet_participants.length} {bet.is_multiplayer ? '' : '/ 2'}</Text>
        
        {bet.status === 'abierta' ? (
          <View style={styles.optionsContainer}>
            {bet.bet_options.map((opt:any) => {
              const voters = bet.bet_participants.filter((p:any) => p.option_id === opt.id);
              return (
                <View key={opt.id} style={styles.optionRow}>
                  <Text style={styles.optionText}>
                    {opt.description} ({voters.length})
                  </Text>
                  {!hasJoined && !isFull && (
                    <NeoButton 
                      title="Apostar" 
                      onPress={() => joinBet(bet, opt.id)}
                      style={{ paddingVertical: 5, paddingHorizontal: 10 }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.resolvedText}>Apuesta Resuelta</Text>
        )}

        {bet.status === 'abierta' && isCreator && (
          <NeoButton 
            title="Resolver Apuesta" 
            onPress={() => setResolvingBet(bet)} 
            variant="secondary"
            style={{ marginTop: 15 }}
          />
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
            <Text style={styles.title} numberOfLines={1}>APUESTAS</Text>
            <Text style={styles.subtitle} numberOfLines={1}>Saldo: {currentMember?.points ?? 0} pts | Apostado: {userBetTotal}/3</Text>
          </View>
        </View>
        <NeoIconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="secondary" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <NeoButton 
          title="+ NUEVA APUESTA" 
          onPress={() => setShowCreateModal(true)} 
          style={{ marginBottom: 20 }}
        />
        
        {bets.map(renderBetCard)}
        {bets.length === 0 && <Text style={styles.emptyText}>No hay apuestas abiertas.</Text>}
      </ScrollView>

      {/* Modal Crear */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <ScrollView>
            <NeoCard style={styles.modalCard}>
              <Text style={styles.modalTitle}>CREAR APUESTA</Text>
              
              <NeoInput label="Descripción (Ej: Gano la próxima)" value={newBetDesc} onChangeText={setNewBetDesc} />
              
              <Text style={styles.label}>Opciones:</Text>
              {newBetOptions.map((opt, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ flex: 1, marginRight: index > 1 ? 10 : 0 }}>
                    <NeoInput 
                      label={`Opción ${index + 1}`} 
                      value={opt} 
                      onChangeText={(val) => {
                        const newOpts = [...newBetOptions];
                        newOpts[index] = val;
                        setNewBetOptions(newOpts);
                      }} 
                    />
                  </View>
                  {index > 1 && (
                    <NeoButton 
                      title="X" 
                      onPress={() => {
                        const newOpts = newBetOptions.filter((_, i) => i !== index);
                        setNewBetOptions(newOpts);
                      }} 
                      variant="secondary"
                      style={{ paddingHorizontal: 15, marginTop: 15 }}
                    />
                  )}
                </View>
              ))}
              
              <NeoButton 
                title="+ Agregar Opción" 
                onPress={() => setNewBetOptions([...newBetOptions, ''])} 
                variant="secondary"
                style={{ marginBottom: 15 }}
              />
              
              <Text style={styles.label}>Puntos a apostar:</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={newBetAmount} onValueChange={(v) => setNewBetAmount(v)}>
                <Picker.Item label="1 Punto" value="1" />
                <Picker.Item label="2 Puntos" value="2" />
                <Picker.Item label="3 Puntos" value="3" />
              </Picker>
            </View>

            <Text style={styles.label}>Modalidad:</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={newBetIsMulti ? 'multi' : '1v1'} onValueChange={(v) => setNewBetIsMulti(v === 'multi')}>
                <Picker.Item label="Múltiples participantes" value="multi" />
                <Picker.Item label="Solo 1 vs 1" value="1v1" />
              </Picker>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <View style={{flex: 1}}><NeoButton title="Cancelar" onPress={() => setShowCreateModal(false)} variant="secondary" /></View>
              <View style={{flex: 1}}><NeoButton title="Crear" onPress={handleCreateBet} /></View>
            </View>
            </NeoCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Resolver */}
      <Modal visible={!!resolvingBet} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <NeoCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>RESOLVER APUESTA</Text>
            <Text style={styles.betDesc}>{resolvingBet?.description}</Text>
            
            <Text style={styles.label}>Selecciona la opción ganadora:</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={winnerOptionId} onValueChange={setWinnerOptionId}>
                <Picker.Item label="-- Seleccionar --" value="" />
                {resolvingBet?.bet_options.map((opt:any) => (
                  <Picker.Item key={opt.id} label={opt.description} value={opt.id} />
                ))}
              </Picker>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <View style={{flex: 1}}><NeoButton title="Cancelar" onPress={() => setResolvingBet(null)} variant="secondary" /></View>
              <View style={{flex: 1}}><NeoButton title="Resolver" onPress={resolveBet} disabled={!winnerOptionId} /></View>
            </View>
          </NeoCard>
        </View>
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
  title: { fontSize: 24, fontWeight: '900', color: theme.colors.primary, textTransform: 'uppercase' },
  subtitle: { fontSize: 14, color: theme.colors.text, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  betCard: { padding: 20, marginBottom: 15 },
  betHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  betDesc: { fontSize: 18, fontWeight: '900', flex: 1, marginRight: 10 },
  badge: { backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 2 },
  badgeText: { color: theme.colors.background, fontWeight: 'bold' },
  betSub: { fontSize: 14, color: '#555', marginTop: 5, fontWeight: 'bold' },
  optionsContainer: { marginTop: 15, borderTopWidth: 2, borderColor: theme.colors.border, paddingTop: 10 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  optionText: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  resolvedText: { marginTop: 15, fontSize: 16, fontWeight: '900', color: theme.colors.secondary, textAlign: 'center' },
  emptyText: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginTop: 20 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
  pickerContainer: { borderWidth: 3, borderColor: theme.colors.border, backgroundColor: theme.colors.background, marginBottom: 10 }
});
