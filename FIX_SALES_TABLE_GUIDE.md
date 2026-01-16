# 🔧 Fix Sales Table - Step by Step Guide

## 🐛 The Problem

The error message shows:
```
"Could not find the 'amount' column of 'sales' in the schema cache"
```

This means either:
1. The `sales` table doesn't exist
2. The `sales` table exists but doesn't have an `amount` column
3. The Supabase schema cache is stale

---

## ✅ Solution - Follow These Steps

### Step 1: Check if Sales Table Exists

1. Go to: https://supabase.com/dashboard/project/maudknbtsodhkpdzkvwg/editor
2. Click **Table Editor** in the left sidebar
3. Look for a table named **sales**

**If you DON'T see the sales table:**
- The table was never created
- Go to **Step 2** to create it

**If you DO see the sales table:**
- Click on it
- Check if there's a column named **amount**
- If NO amount column → Go to **Step 2** to recreate it
- If YES amount column exists → Go to **Step 3** to refresh cache

---

### Step 2: Create/Recreate the Sales Table

1. Go to: https://supabase.com/dashboard/project/maudknbtsodhkpdzkvwg/sql
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste this SQL:

```sql
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

-- Disable RLS for testing (we'll enable it later for production)
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
```

5. Click **Run** (or press `Ctrl+Enter`)
6. You should see: **"Success. No rows returned"**

---

### Step 3: Refresh Schema Cache

1. Go to: https://supabase.com/dashboard/project/maudknbtsodhkpdzkvwg/settings/api
2. Scroll down to find **"Schema"** section
3. Click the **"Reload schema cache"** button
4. Wait for confirmation

---

### Step 4: Verify the Table Structure

1. Go back to: https://supabase.com/dashboard/project/maudknbtsodhkpdzkvwg/sql
2. Run this query:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sales'
ORDER BY ordinal_position;
```

3. You should see these columns:
   - id (uuid)
   - date (date)
   - employee (text)
   - category (text)
   - service_type (text)
   - **amount (numeric)** ← This is the important one!
   - payment_method (text)
   - vehicle_model (text)
   - vehicle_service_type (text)
   - motorbike_service_type (text)
   - number_of_motorbikes (integer)
   - carpet_service_type (text)
   - size (text)
   - description (text)
   - timestamp (timestamp with time zone)
   - created_at (timestamp with time zone)

---

### Step 5: Test with a Manual Insert

1. In SQL Editor, run this test:

```sql
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
  'Test sale from SQL'
);

-- Check if it was inserted
SELECT * FROM sales ORDER BY created_at DESC LIMIT 1;
```

2. You should see the test record inserted successfully

---

### Step 6: Test from Your App

1. Go back to: http://localhost:3000
2. **Hard refresh** the page: `Ctrl+Shift+R`
3. Navigate to **💰 Daily Sales**
4. Try to add a sale again
5. It should work now! ✅

---

## 🎯 Quick Checklist

- [ ] Sales table exists in Supabase
- [ ] Sales table has `amount` column
- [ ] Schema cache refreshed
- [ ] Test insert works in SQL Editor
- [ ] App can save sales successfully

---

## 🆘 If It Still Doesn't Work

Send me a screenshot of:
1. The result of the column check query (Step 4)
2. The browser console when trying to save a sale
3. Any error messages from Supabase SQL Editor

---

## 📝 Notes

- The `DROP TABLE` command will delete all existing sales data
- Make sure you're okay with this before running it
- If you have important data, export it first from Table Editor
- After fixing, all new sales will save to Supabase correctly

