# 🚀 Netlify Environment Variables Setup

## ✅ Local Setup Complete!

Your local `.env` file now has the correct Supabase credentials and your app should be connecting to Supabase when running locally.

---

## 🌐 Configure Netlify (Required for Production)

To make your hosted app work with Supabase, you need to add environment variables to Netlify.

### **Step 1: Go to Netlify Dashboard**

1. Visit: https://app.netlify.com/sites/safishahub/configuration/env
2. Or navigate manually:
   - Go to https://app.netlify.com
   - Click on your **safishahub** site
   - Click **Site configuration** (left sidebar)
   - Click **Environment variables**

---

### **Step 2: Add Environment Variables**

Click **"Add a variable"** or **"Add environment variables"** and add these **TWO** variables:

#### **Variable 1:**
```
Key: REACT_APP_SUPABASE_URL
Value: https://maudknbtsodhkpdzkvwg.supabase.co
Scopes: All scopes (or at least "Production")
```

#### **Variable 2:**
```
Key: REACT_APP_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdWRrbmJ0c29kaGtwZHprdndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTU3MDMsImV4cCI6MjA4MDg5MTcwM30.WuI0nc4u23BUIHTwI5StzbzndKhgHSb5DdO8n3M8Rwo
Scopes: All scopes (or at least "Production")
```

---

### **Step 3: Trigger a New Deploy**

After adding the environment variables:

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** dropdown
3. Select **"Deploy site"**
4. Wait 1-2 minutes for the build to complete

---

### **Step 4: Test Your Live Site**

Once deployed, visit: https://safishahub.netlify.app/

**Test the following:**
1. ✅ Add a new employee
2. ✅ Check if it appears in Supabase dashboard
3. ✅ Refresh the page - data should persist
4. ✅ Open in another browser/device - data should sync

---

## 🔍 Verify Data in Supabase

To confirm data is being saved:

1. Go to: https://supabase.com/dashboard/project/maudknbtsodhkpdzkvwg/editor
2. Click on the **employees** table
3. You should see the employee you just added!

---

## ⚠️ Important Notes

- **Environment variables are NOT in your code** - They're stored securely in Netlify
- **Never commit `.env` to Git** - It's already in `.gitignore`
- **Changes to env vars require a redeploy** - Netlify needs to rebuild with new values

---

## 🆘 Troubleshooting

### **If data still doesn't save on Netlify:**

1. **Check environment variables are set:**
   - Go to Netlify → Site configuration → Environment variables
   - Verify both variables are there

2. **Check the deploy log:**
   - Go to Netlify → Deploys → Click latest deploy
   - Look for any errors in the build log

3. **Check browser console:**
   - Open https://safishahub.netlify.app/
   - Press F12 to open DevTools
   - Check Console tab for errors

4. **Verify Supabase connection:**
   - In browser console, type: `localStorage.getItem('supabase.auth.token')`
   - Should show connection info

---

## ✅ Success Checklist

- [ ] Added `REACT_APP_SUPABASE_URL` to Netlify
- [ ] Added `REACT_APP_SUPABASE_ANON_KEY` to Netlify
- [ ] Triggered a new deploy
- [ ] Tested adding data on live site
- [ ] Verified data appears in Supabase dashboard

---

## 🎉 You're Done!

Once you complete these steps, your Netlify app will be fully connected to Supabase and all data will sync to the cloud!

