import React from 'react';
import { isSupabaseConfigured, supabase } from '../config/supabase';

/**
 * Diagnostic component to check Supabase configuration
 * This helps debug environment variable issues
 */
const DiagnosticInfo = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const hasAnonKey = !!process.env.REACT_APP_SUPABASE_ANON_KEY;
  const isConfigured = isSupabaseConfigured();
  const hasSupabaseClient = !!supabase;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#1a1a1a',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#4ade80' }}>
        🔍 Supabase Diagnostic
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>URL:</strong> {supabaseUrl || '❌ Not set'}
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>Anon Key:</strong> {hasAnonKey ? '✅ Present' : '❌ Missing'}
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>Is Configured:</strong> {isConfigured ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>Client Created:</strong> {hasSupabaseClient ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #333', fontSize: '10px', color: '#888' }}>
        {isConfigured 
          ? '✅ Using Supabase' 
          : '⚠️ Using localStorage fallback'}
      </div>
    </div>
  );
};

export default DiagnosticInfo;

