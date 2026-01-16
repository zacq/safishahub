import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// TODO: Replace these with your actual Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

// Debug logging
console.log('🔧 Supabase Config Loaded:');
console.log('  - REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL || 'NOT SET');
console.log('  - REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET');
console.log('  - supabaseUrl:', supabaseUrl);
console.log('  - Has anon key:', !!supabaseAnonKey);

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  const configured = process.env.REACT_APP_SUPABASE_URL &&
         process.env.REACT_APP_SUPABASE_ANON_KEY &&
         process.env.REACT_APP_SUPABASE_URL.includes('supabase.co') &&
         !process.env.REACT_APP_SUPABASE_URL.includes('placeholder');

  console.log('  - isSupabaseConfigured():', configured);
  return configured;
};

// Create Supabase client only if configured, otherwise create a dummy client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

console.log('  - Supabase client created:', !!supabase);

