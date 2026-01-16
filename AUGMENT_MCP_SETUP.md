# 🚀 Supabase MCP Setup for Augment Code

## Quick Setup Guide

### Step 1: Open Augment Settings

1. Open **VS Code**
2. Click the **Augment** icon in the left sidebar
3. Click the **⚙️ (Settings)** icon in the upper right corner of the Augment panel
4. Scroll down to the **MCP** section

### Step 2: Import Configuration

1. Click **"Import from JSON"** button
2. Copy and paste this JSON:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_e1d80cc701980b5c8a2f126b2b8cd034dcb94e0d"
      ]
    }
  }
}
```

3. Click **"Save"**

### Step 3: Verify It's Working

In the Augment chat, ask:
- "List my Supabase projects"
- "What Supabase tools are available?"

If MCP is working, I'll be able to interact with your Supabase account!

---

## 🎯 What You Can Do After Setup

Once MCP is configured, you can ask me to:

✅ **Create database tables** - "Create all SafishaHub tables"  
✅ **Set up storage** - "Create employee-photos bucket"  
✅ **Run SQL queries** - "Show me all sales from today"  
✅ **Generate types** - "Generate TypeScript types for my schema"  
✅ **Fetch config** - "Get my Supabase project URL and API key"  
✅ **Manage migrations** - "Create a migration to add a status column"  

---

## 🔒 Security Note

Your personal access token is stored in Augment's settings. It's not committed to git and is only accessible to your Augment extension.

**Token:** `sbp_e1d80cc701980b5c8a2f126b2b8cd034dcb94e0d`

If you need to regenerate it:
1. Go to https://supabase.com/dashboard/account/tokens
2. Generate a new token
3. Update the configuration in Augment Settings

---

## 📚 Resources

- **Augment MCP Docs**: https://docs.augmentcode.com/setup-augment/mcp
- **Supabase MCP Server**: https://github.com/supabase-community/supabase-mcp
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## ✅ Next Steps

1. **Add the MCP configuration** (follow steps above)
2. **Test it** by asking me to list your Supabase projects
3. **Create your database** - I'll set up all tables automatically!

**Ready to set up your Supabase backend! 🎉**

