-- Migration: Create sales table with correct schema
-- Created: 2026-01-16
-- Purpose: Fix the missing 'amount' column error

-- Drop existing table if it exists (WARNING: This deletes all data!)
DROP TABLE IF EXISTS sales CASCADE;

-- Create the sales table with correct structure
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

-- Create indexes for better performance
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_employee ON sales(employee);
CREATE INDEX idx_sales_category ON sales(category);

-- Disable RLS for testing (enable later for production)
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;

