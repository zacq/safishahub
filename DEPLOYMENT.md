# Safisha Hub - Netlify Deployment Guide

## 🚀 Quick Deploy to Netlify

### Prerequisites
- GitHub account with this repository
- Netlify account (free tier works)
- Supabase project (already set up)

---

## 📋 Step-by-Step Deployment

### 1. **Connect to Netlify**

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** as your Git provider
4. Select the repository: `zacq/safishahub`
5. Configure build settings:
   - **Branch to deploy:** `master`
   - **Build command:** `CI=false npm run build`
   - **Publish directory:** `build`

### 2. **Set Environment Variables**

In Netlify dashboard, go to:
**Site settings** → **Environment variables** → **Add a variable**

Add these two variables:

```
REACT_APP_SUPABASE_URL=https://maudknbtsodhkpdzkvwg.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdWRrbmJ0c29kaGtwZHprdndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTU3MDMsImV4cCI6MjA4MDg5MTcwM30.WuI0nc4u23BUIHTwI5StzbzndKhgHSb5DdO8n3M8Rwo
```

### 3. **Deploy**

Click **"Deploy site"** and wait for the build to complete (usually 2-3 minutes).

---

## ✅ Verify Deployment

Once deployed, test these features:

### 1. **Daily Sales Module**
- Navigate to 💰 Daily Sales
- Add a vehicle wash sale
- Check browser console for Supabase logs
- Verify data appears in Supabase dashboard

### 2. **Autodetailing Leads Module**
- Navigate to 🚗 Autodetailing Leads
- Add a new lead
- Check browser console for Supabase logs
- Verify data appears in Supabase dashboard

### 3. **Check Supabase Data**
- Go to: https://supabase.com/dashboard/project/maudknbtsodhkpdzkvwg/editor
- Check `sales` table for sales records
- Check `leads` table for lead records

---

## 🔧 Build Configuration

### Files Already Configured:

✅ **netlify.toml** - Netlify build settings
```toml
[build]
  command = "CI=false npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

✅ **package.json** - Build script with env check
```json
"scripts": {
  "build": "node check-env.js && react-scripts build"
}
```

✅ **check-env.js** - Validates environment variables during build

---

## 📊 Database Tables

The following tables are already created in Supabase:

### `sales` table
- Stores all sales records (vehicle, motorbike, carpet)
- Columns: id, date, employee, category, service_type, amount, etc.

### `leads` table
- Stores autodetailing leads
- Columns: id, vehicle_model, number_plate, customer_name, customer_phone, date

---

## 🐛 Troubleshooting

### Build Fails
- Check Netlify build logs
- Ensure environment variables are set correctly
- Verify Node.js version (should use latest LTS)

### Data Not Saving
- Open browser console (F12)
- Look for Supabase connection logs
- Verify environment variables in Netlify dashboard
- Check Supabase project is active

### CORS Errors
- Ensure Supabase URL is correct
- Check that RLS is disabled on tables (for testing)
- Verify anon key is correct

---

## 📱 Post-Deployment

After successful deployment:

1. **Test all modules** thoroughly
2. **Share the Netlify URL** with your team
3. **Monitor Supabase usage** in the dashboard
4. **Set up custom domain** (optional) in Netlify settings

---

## 🔄 Continuous Deployment

Every push to the `master` branch will automatically trigger a new deployment on Netlify.

To deploy changes:
```bash
git add .
git commit -m "Your commit message"
git push origin master
```

Netlify will automatically build and deploy within 2-3 minutes.

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Review Netlify build logs
3. Verify Supabase dashboard for data
4. Check environment variables are set correctly

---

**Last Updated:** 2026-01-16
**Version:** 1.0.0

