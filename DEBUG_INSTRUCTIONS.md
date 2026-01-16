# 🔍 Debug Instructions for Sales Module

## Problem
The local version is not sending data to Supabase.

## What I've Added
I've added extensive console logging to help us debug the issue. The logs will show:
- ✅ Whether Supabase is configured
- ✅ Whether the Supabase client exists
- ✅ What data is being sent
- ✅ Whether it's using localStorage fallback or Supabase

## How to Debug

### Step 1: Start the Development Server
```bash
npm start
```

### Step 2: Open Browser Console
1. Open your browser (Chrome/Edge/Firefox)
2. Press `F12` to open Developer Tools
3. Click on the **Console** tab

### Step 3: Navigate to Daily Sales
1. Go to http://localhost:3000
2. Click on **💰 Daily Sales**

### Step 4: Check the Console Logs
You should see logs like this:

```
🔍 Records: Loading sales from Supabase...
🔍 salesService.getAll: Checking Supabase configuration...
  - isSupabaseConfigured(): true/false
  - supabase client exists: true/false
```

**If you see:**
- `isSupabaseConfigured(): false` → **Environment variables not loaded**
- `isSupabaseConfigured(): true` but `supabase client exists: false` → **Supabase client creation failed**
- `⚠️ Using localStorage fallback` → **Supabase not configured, using localStorage**

### Step 5: Try to Add a Sale
1. Select an employee
2. Select a service type (Vehicle/Motorbike/Carpet)
3. Fill in the form
4. Click "Record Sale"

### Step 6: Check Console for Save Logs
You should see:

```
💾 Records: Saving sale to Supabase...
🔍 salesService.create: Checking Supabase configuration...
  - isSupabaseConfigured(): true/false
  - supabase client exists: true/false
  - saleData: {...}
```

**If successful:**
```
✅ salesService.create: Sale created successfully!
```

**If using fallback:**
```
⚠️ salesService.create: Using localStorage fallback
```

## Common Issues & Solutions

### Issue 1: Environment Variables Not Loaded
**Symptoms:**
- `isSupabaseConfigured(): false`
- Console shows: `⚠️ Using localStorage fallback`

**Solution:**
1. Stop the dev server (`Ctrl+C`)
2. Check that `.env` file exists in the root directory
3. Verify `.env` contains:
   ```
   REACT_APP_SUPABASE_URL=https://maudknbtsodhkpdzkvwg.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Restart the dev server: `npm start`
5. **Hard refresh** the browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Issue 2: Supabase Client Not Created
**Symptoms:**
- `isSupabaseConfigured(): true`
- `supabase client exists: false`

**Solution:**
1. Check browser console for errors
2. Verify Supabase package is installed: `npm list @supabase/supabase-js`
3. If not installed: `npm install @supabase/supabase-js`
4. Restart dev server

### Issue 3: CORS or Network Errors
**Symptoms:**
- Console shows network errors
- `Failed to fetch` errors

**Solution:**
1. Check internet connection
2. Verify Supabase project is active: https://supabase.com/dashboard/project/maudknbtsodhkpdzkvwg
3. Check if RLS policies are blocking requests

## What to Send Me

After following these steps, please send me:

1. **Screenshot of the console logs** when you:
   - Load the Daily Sales page
   - Try to add a sale

2. **The exact error messages** (if any)

3. **The values shown in the logs:**
   - `isSupabaseConfigured(): ?`
   - `supabase client exists: ?`

This will help me identify exactly what's going wrong!

## Quick Test

You can also check if Supabase is configured by opening the browser console and typing:

```javascript
console.log('SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('HAS_ANON_KEY:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
```

**Expected output:**
```
SUPABASE_URL: https://maudknbtsodhkpdzkvwg.supabase.co
HAS_ANON_KEY: true
```

If you see `undefined`, the environment variables are not loaded.

