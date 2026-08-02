import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, PixelRatio, Image } from 'react-native';
import { theme } from '../styles/theme';
import { NeoCard } from '../components/NeoCard';
import { NeoButton } from '../components/NeoButton';
import { NeoIconButton } from '../components/NeoIconButton';
import { NeoInput } from '../components/NeoInput';
import { supabase } from '../lib/supabase';

import DateTimePicker from '@react-native-community/datetimepicker';

export const CreateJuntadaScreen = ({ route, navigation }: any) => {
  const { groupId, groupName } = route.params;
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const fontScale = PixelRatio.getFontScale();
  const isLargeFont = fontScale > 1.2;

  const handleCreate = async () => {
    if (!name.trim() || !location.trim()) {
      Alert.alert('Error', 'Debes completar el nombre y la ubicación');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No estás autenticado');

      const { error } = await supabase
        .from('juntadas')
        .insert({ 
          group_id: groupId, 
          name: name,
          location: location,
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

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = new Date(eventDate);
      currentDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setEventDate(currentDate);
    }
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const currentDate = new Date(eventDate);
      currentDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setEventDate(currentDate);
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
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>NUEVA JUNTADA</Text>
            <Text style={styles.subtitle} numberOfLines={1}>Grupo: {groupName}</Text>
          </View>
        </View>
        <NeoIconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="secondary" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            label="Ubicación"
            placeholder="Ej: Casa de Simón"
            value={location}
            onChangeText={setLocation}
          />

          <View style={styles.spacer} />

          <Text style={styles.label}>Fecha y Hora</Text>
          <View style={{flexDirection: isLargeFont ? 'column' : 'row', gap: 8, marginBottom: 8}}>
            <View style={{flex: 1}}>
              <NeoButton 
                title={eventDate.toLocaleDateString()} 
                onPress={() => setShowDatePicker(true)} 
                variant="secondary"
              />
            </View>
            <View style={{flex: 1}}>
              <NeoButton 
                title={eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                onPress={() => setShowTimePicker(true)} 
                variant="secondary"
              />
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={eventDate}
              mode="time"
              display="default"
              onChange={onChangeTime}
            />
          )}
          
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
  label: {
    fontSize: theme.typography.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  card: {
    padding: 24,
  },
  spacer: {
    height: 16,
  }
});
