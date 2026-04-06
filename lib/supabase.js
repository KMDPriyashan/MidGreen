import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qbwnrbrpcpausstesdoa.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFid25yYnJwY3BhdXNzdGVzZG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Njg0NjEsImV4cCI6MjA5MTA0NDQ2MX0.SVzvMmFtPoQvrcfR_n7_w2VMveBG6GU982WC3HRYmP8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});