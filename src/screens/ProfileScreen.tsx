import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { theme } from '../styles/theme';
import { NeoButton } from '../components/NeoButton';
import { NeoInput } from '../components/NeoInput';
import { NeoCard } from '../components/NeoCard';
import { NeoIconButton } from '../components/NeoIconButton';
import * as ImagePicker from 'expo-image-picker';
import { DEFAULT_AVATAR_IDS, getAvatarSource } from '../utils/avatars';
import { decode } from 'base64-arraybuffer';

export const ProfileScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setCurrentUser(session.user);

      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (newUrl?: string) => {
    try {
      setSaving(true);
      const urlToSave = newUrl !== undefined ? newUrl : avatarUrl;
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          avatar_url: urlToSave
        })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      if (newUrl !== undefined) setAvatarUrl(newUrl);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso denegado", "Se necesita acceso a la galería para subir una foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      await uploadAvatar(asset);
    }
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setSaving(true);
      const ext = asset.uri.split('.').pop() || 'jpg';
      const fileName = `${currentUser.id}_${Date.now()}.${ext}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload base64
      if (!asset.base64) throw new Error("Base64 data missing");

      // Assuming we have an 'avatars' bucket in Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(asset.base64), {
          contentType: `image/${ext}`,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await saveProfile(publicUrl);
    } catch (e: any) {
      Alert.alert('Error al subir', e.message);
      setSaving(false);
    }
  };

  const selectDefaultAvatar = async (id: string) => {
    await saveProfile(id);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MI PERFIL</Text>
        <NeoIconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="secondary" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
      
      <NeoCard style={styles.card}>
        <View style={styles.currentAvatarContainer}>
          {avatarUrl ? (
            <Image source={getAvatarSource(avatarUrl)!} style={styles.currentAvatar} />
          ) : (
            <View style={[styles.currentAvatar, styles.placeholderAvatar]}>
              <Text style={styles.placeholderText}>{username?.charAt(0)?.toUpperCase() || '?'}</Text>
            </View>
          )}
        </View>

        <Text style={styles.label}>Nombre de Usuario</Text>
        <NeoInput
          placeholder="Tu nombre de usuario"
          value={username}
          onChangeText={setUsername}
        />
        
        <NeoButton 
          title={saving ? "Guardando..." : "Guardar Nombre"} 
          onPress={() => saveProfile()} 
          style={{ marginTop: 10 }}
        />
      </NeoCard>

      <Text style={styles.sectionTitle}>Elegir Avatar</Text>
      
      <NeoButton 
        title="Subir foto desde galería" 
        onPress={handlePickImage} 
        style={{ marginBottom: 20 }}
      />

      <Text style={styles.subtitle}>O elige uno por defecto:</Text>
      <View style={styles.avatarGrid}>
        {DEFAULT_AVATAR_IDS.map((id, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.avatarOption, avatarUrl === id && styles.avatarSelected]}
            onPress={() => selectDefaultAvatar(id)}
          >
            <Image source={getAvatarSource(id)!} style={styles.avatarImage} />
          </TouchableOpacity>
        ))}
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginBottom: 15,
  },
  card: {
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  currentAvatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: theme.borders.width,
    borderColor: theme.colors.border,
  },
  placeholderAvatar: {
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  avatarOption: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  avatarSelected: {
    borderColor: theme.colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  }
});
