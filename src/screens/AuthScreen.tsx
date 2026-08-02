import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { theme } from '../styles/theme';
import { NeoButton } from '../components/NeoButton';
import { NeoInput } from '../components/NeoInput';
import { NeoCard } from '../components/NeoCard';
import { supabase } from '../lib/supabase';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        Alert.alert('Error al iniciar sesión', error.message);
      } else {
        Alert.alert('¡Éxito!', 'Iniciaste sesión correctamente.');
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });
      
      if (error) {
        Alert.alert('Error al registrarse', error.message);
      } else {
        // LOG PARA TESTING
        console.log('--- NUEVO REGISTRO (TEST) ---');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Username: ${username}`);
        console.log('-----------------------------');

        Alert.alert('¡Registro exitoso!', 'Revisa tu correo para confirmar la cuenta (si tienes habilitada la confirmación por correo) o intenta iniciar sesión.');
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.header}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>QUÓRUM</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Inicia sesión para auditar' : 'Firma tu contrato digital'}
          </Text>
        </View>

        <NeoCard style={styles.card}>
          {!isLogin && (
            <NeoInput
              label="Usuario"
              placeholder="Ej: ElMago33"
              value={username}
              onChangeText={setUsername}
            />
          )}
          
          <NeoInput
            label="Email"
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          <NeoInput
            label="Contraseña"
            placeholder="********"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <View style={styles.spacer} />
          
          <NeoButton 
            title={loading ? 'Cargando...' : (isLogin ? 'Ingresar' : 'Registrarse')} 
            onPress={handleSubmit} 
            disabled={loading}
          />
          
          <NeoButton 
            title={isLogin ? 'Crear cuenta nueva' : 'Ya tengo una cuenta'} 
            onPress={() => setIsLogin(!isLogin)} 
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    textShadowColor: theme.colors.border,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginTop: 8,
  },
  card: {
    padding: 24,
  },
  spacer: {
    height: 16,
  }
});
