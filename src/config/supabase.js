import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// TODO: Replace these with your actual Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'YOUR_SUPABASE_URL' && 
         supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
         supabaseUrl.includes('supabase.co');
};

