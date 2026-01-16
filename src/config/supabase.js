import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// TODO: Replace these with your actual Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return process.env.REACT_APP_SUPABASE_URL &&
         process.env.REACT_APP_SUPABASE_ANON_KEY &&
         process.env.REACT_APP_SUPABASE_URL.includes('supabase.co') &&
         !process.env.REACT_APP_SUPABASE_URL.includes('placeholder');
};

// Create Supabase client only if configured, otherwise create a dummy client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

