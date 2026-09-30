// Must be first: Supabase's auth needs crypto.getRandomValues, which React Native lacks
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// createClient() throws on a missing URL, which would crash the app at import time
// for anyone who cloned the repo without a .env. Stay null instead and let the UI
// render a "not configured" panel.
export const configured = Boolean(supabaseUrl && supabasePublishableKey);

if (!configured) {
  console.warn(
    'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env (see .env.example).'
  );
}

export const supabase = configured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
