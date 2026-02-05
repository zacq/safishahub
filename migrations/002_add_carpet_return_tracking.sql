-- Migration: Add carpet return tracking fields
-- Created: 2026-02-05
-- Purpose: Track when carpets are returned to customers after drying

-- Add returned status and returned_date columns to sales table
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS returned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS returned_date TIMESTAMPTZ;

-- Add index for faster queries on returned status
CREATE INDEX IF NOT EXISTS idx_sales_returned ON sales(returned) WHERE category = 'carpet';

-- Add comment to explain the fields
COMMENT ON COLUMN sales.returned IS 'Indicates if a carpet has been returned to the customer (only applicable for carpet category)';
COMMENT ON COLUMN sales.returned_date IS 'Timestamp when the carpet was marked as returned to the customer';

-- Update existing carpet sales to have returned = false (if not already set)
UPDATE sales 
SET returned = FALSE 
WHERE category = 'carpet' AND returned IS NULL;

