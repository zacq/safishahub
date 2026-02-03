// Script to update leads table schema to support asset types
const PROJECT_REF = 'maudknbtsodhkpdzkvwg';
const SUPABASE_ACCESS_TOKEN = 'sbp_458851118e8c297f030559c87178a5b0fbe1322f';

async function updateLeadsTable() {
  try {
    console.log('🔧 Updating leads table schema...');

    // Drop the old table and create new one with updated schema
    const sql = `
-- Drop old table
DROP TABLE IF EXISTS leads CASCADE;

-- Create new leads table with asset type support
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('vehicle', 'motorbike', 'carpet')),

  -- Vehicle fields
  vehicle_model TEXT,
  registration_number TEXT,

  -- Motorbike fields
  motorbike_model TEXT,

  -- Carpet fields
  carpet_type TEXT,
  carpet_size TEXT,

  -- Common fields
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_leads_asset_type ON leads(asset_type);
CREATE INDEX idx_leads_date ON leads(date DESC);

-- Disable RLS for testing
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
`;

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`
        },
        body: JSON.stringify({ query: sql })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update table: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Leads table updated successfully!');
    console.log('\n📋 New schema:');
    console.log('  - asset_type: vehicle | motorbike | carpet');
    console.log('  - vehicle_model, registration_number (for vehicles)');
    console.log('  - motorbike_model (for motorbikes)');
    console.log('  - carpet_type, carpet_size (for carpets)');
    console.log('  - customer_name, customer_phone (required for all)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateLeadsTable();

