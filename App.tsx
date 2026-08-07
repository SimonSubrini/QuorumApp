import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';

import { theme } from './src/styles/theme';
import { supabase } from './src/lib/supabase';

import { AuthScreen } from './src/screens/AuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CreateGroupScreen } from './src/screens/CreateGroupScreen';
import { JoinGroupScreen } from './src/screens/JoinGroupScreen';
import { GroupDetailsScreen } from './src/screens/GroupDetailsScreen';
import { CreateJuntadaScreen } from './src/screens/CreateJuntadaScreen';
import { JuntadaDetailsScreen } from './src/screens/JuntadaDetailsScreen';
import { CreateMatchScreen } from './src/screens/CreateMatchScreen';
import { RandomizadorScreen } from './src/screens/RandomizadorScreen';
import { BetsScreen } from './src/screens/BetsScreen';
import { VotesScreen } from './src/screens/VotesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session ? (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
              <Stack.Screen name="JoinGroup" component={JoinGroupScreen} />
              <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
              <Stack.Screen name="CreateJuntada" component={CreateJuntadaScreen} />
              <Stack.Screen name="JuntadaDetails" component={JuntadaDetailsScreen} />
              <Stack.Screen name="CreateMatch" component={CreateMatchScreen} />
              <Stack.Screen name="Randomizador" component={RandomizadorScreen} />
              <Stack.Screen name="Bets" component={BetsScreen} />
              <Stack.Screen name="Votes" component={VotesScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </SafeAreaView>
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
