import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Reemplazar con tus credenciales reales
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'TU_SUPABASE_URL';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'TU_SUPABASE_PUBLISHABLE_KEY';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Solo útil para Web, en React Native se suele manejar con Deep Linking
  },
});
