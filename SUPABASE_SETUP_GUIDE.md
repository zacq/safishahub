# 🚀 Supabase Integration Setup Guide for SafishaHub

This guide will walk you through setting up Supabase as the backend for your SafishaHub application.

## 📋 Table of Contents
1. [Create Supabase Account & Project](#step-1-create-supabase-account--project)
2. [Set Up Database Tables](#step-2-set-up-database-tables)
3. [Configure Storage](#step-3-configure-storage)
4. [Install Dependencies](#step-4-install-dependencies)
5. [Configure Environment Variables](#step-5-configure-environment-variables)
6. [Test the Integration](#step-6-test-the-integration)

---

## Step 1: Create Supabase Account & Project

### 1.1 Sign Up
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

### 1.2 Create New Project
1. Click "New Project"
2. Fill in the details:
   - **Organization**: Create new or select existing
   - **Project Name**: `SafishaHub`
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Select closest to Kenya (e.g., `Singapore (Southeast Asia)` or `Frankfurt (Europe)`)
   - **Pricing Plan**: Free (perfect for starting)
3. Click "Create new project"
4. Wait 2-3 minutes for provisioning

### 1.3 Get API Credentials
1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy and save these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

---

## Step 2: Set Up Database Tables

### 2.1 Open SQL Editor
1. In Supabase dashboard, click **SQL Editor** in sidebar
2. Click **New Query**

### 2.2 Create Tables

Copy and paste this SQL script, then click **Run**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: Sales
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

-- Indexes for sales
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_employee ON sales(employee);
CREATE INDEX idx_sales_category ON sales(category);

-- Table 2: Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  id_number TEXT NOT NULL UNIQUE,
  image_url TEXT,
  date_added DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for employees
CREATE INDEX idx_employees_name ON employees(name);

-- Table 3: Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for expenses
CREATE INDEX idx_expenses_date ON expenses(date);

-- Table 4: Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notes
CREATE INDEX idx_notes_date ON notes(date);
CREATE INDEX idx_notes_category ON notes(category);

-- Table 5: Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_model TEXT NOT NULL,
  number_plate TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leads
CREATE INDEX idx_leads_number_plate ON leads(number_plate);
CREATE INDEX idx_leads_customer_phone ON leads(customer_phone);
```

### 2.3 Verify Tables
1. Click **Table Editor** in sidebar
2. You should see 5 tables: `sales`, `employees`, `expenses`, `notes`, `leads`

---

## Step 3: Configure Storage

### 3.1 Create Storage Bucket
1. Click **Storage** in sidebar
2. Click **New bucket**
3. Fill in:
   - **Name**: `employee-photos`
   - **Public bucket**: ✅ Check this (or leave unchecked for private)
   - **File size limit**: `2MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif`
4. Click **Create bucket**

### 3.2 Set Storage Policies (if public)
1. Click on `employee-photos` bucket
2. Click **Policies** tab
3. Click **New policy**
4. Select **For full customization**
5. Add this policy for public read access:

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'employee-photos' );
```

---

## Step 4: Install Dependencies

Run this command in your project terminal:

```bash
npm install @supabase/supabase-js
```

---

## Step 5: Configure Environment Variables

### 5.1 Create .env file
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

### 5.2 Add Supabase Credentials
Edit `.env` and add your credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with the values you copied in Step 1.3

### 5.3 Restart Development Server
```bash
npm start
```

---

## Step 6: Test the Integration

### 6.1 Check Configuration
The app will automatically detect if Supabase is configured. If not configured, it will fall back to localStorage.

### 6.2 Test Each Feature
1. **Add Employee** → Check Supabase dashboard → Table Editor → employees
2. **Add Sale** → Check sales table
3. **Add Expense** → Check expenses table
4. **Add Note** → Check notes table
5. **Add Lead** → Check leads table

---

## 🎯 Benefits of Supabase Integration

✅ **Cloud Storage** - Data persists across devices
✅ **Real-time Sync** - Multiple users can work simultaneously
✅ **Automatic Backups** - Supabase handles backups
✅ **Scalability** - Grows with your business
✅ **Security** - Row Level Security (RLS) protection
✅ **Free Tier** - 500MB database, 1GB file storage
✅ **Fallback Support** - Works offline with localStorage

---

## 🔒 Security Best Practices

1. **Never commit .env** - It's in .gitignore
2. **Use Row Level Security** - Enable RLS policies in production
3. **Rotate keys** - Change API keys if exposed
4. **Limit permissions** - Use anon key for public access only

---

## 📊 Monitoring & Analytics

Access your Supabase dashboard to:
- View real-time database activity
- Monitor API usage
- Check storage usage
- View logs and errors

---

## 🆘 Troubleshooting

### Issue: "Failed to fetch"
- Check internet connection
- Verify Supabase URL and API key
- Check Supabase project status

### Issue: "Permission denied"
- Enable RLS policies
- Check table permissions
- Verify API key is correct

### Issue: "Storage upload failed"
- Check bucket exists
- Verify file size < 2MB
- Check MIME type is allowed

---

## 📚 Next Steps

1. ✅ Set up Supabase project
2. ✅ Create database tables
3. ✅ Configure storage
4. ✅ Install dependencies
5. ✅ Add environment variables
6. ⏭️ Integrate with components (optional - already done!)
7. ⏭️ Enable Row Level Security (for production)
8. ⏭️ Set up real-time subscriptions (optional)

---

**Your SafishaHub app is now ready to use Supabase! 🎉**

