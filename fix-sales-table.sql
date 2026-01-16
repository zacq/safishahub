-- ============================================
-- FIX SALES TABLE - Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check if sales table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sales'
ORDER BY ordinal_position;

-- Step 2: If the table doesn't have the correct structure, drop and recreate it
-- WARNING: This will delete all existing sales data!
-- Only run this if you're okay with losing existing data

-- Uncomment the lines below to drop and recreate:
/*
DROP TABLE IF EXISTS sales CASCADE;

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  employee TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('vehicle', 'motorbike', 'carpet')),
  service_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  vehicle_model TEXT,
  vehicle_service_type TEXT,
  motorbike_service_type TEXT,
  number_of_motorbikes INTEGER,
  carpet_service_type TEXT,
  size TEXT,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_employee ON sales(employee);
CREATE INDEX idx_sales_category ON sales(category);

-- Disable RLS for testing (enable later for production)
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
*/

-- Step 3: Test insert (to verify the table works)
-- Uncomment to test:
/*
INSERT INTO sales (
  date,
  employee,
  category,
  service_type,
  amount,
  payment_method,
  vehicle_model,
  vehicle_service_type,
  description
) VALUES (
  '2026-01-16',
  'Test Employee',
  'vehicle',
  'Vehicle Wash',
  100.00,
  'Cash',
  'Toyota',
  'Interior Clean',
  'Test sale'
);

-- Check if it was inserted
SELECT * FROM sales ORDER BY created_at DESC LIMIT 1;
*/

