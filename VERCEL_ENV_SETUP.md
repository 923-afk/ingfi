# 🔑 Vercel Environment Variables Setup

**Your Vercel Project:** https://vercel.com/berbers-projects-eb2c67b0/ingfi

---

## ⚠️ **CRITICAL: Set Environment Variables**

Your app **will not work** without these environment variables!

### Step 1: Go to Environment Variables Settings

**Direct Link:** https://vercel.com/berbers-projects-eb2c67b0/ingfi/settings/environment-variables

Or navigate:
1. Go to: https://vercel.com/berbers-projects-eb2c67b0/ingfi
2. Click **Settings** tab
3. Click **Environment Variables** in left sidebar

---

## 📝 **Add These Variables**

### Variable 1: Supabase URL

- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://hsdldrvsanmviuawdckp.supabase.co`
- **Environments:** 
  - ✅ Production
  - ✅ Preview  
  - ✅ Development
- Click **Save**

### Variable 2: Supabase Anon Key

- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZGxkcnZzYW5tdml1YXdkY2twIiwicm9sZSI6ImFub24iLCJpY3QiOjE3NjMzODY2NDQsImV4cCI6MjA3ODk2MjY0NH0.H3NYRqk0aWMJ0dlxAWV8ka13nubTFSa9Z-ElU6buDAQ`
- **Environments:**
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- Click **Save**

---

## 🔄 **After Adding Variables**

1. **Redeploy your app:**
   - Go to **Deployments** tab
   - Click **...** on latest deployment
   - Click **Redeploy**
   - Or wait for next automatic deployment

2. **Verify it works:**
   - Visit: `https://your-app.vercel.app/api/test-supabase`
   - Should return: `{"success": true, "tables": "ready"}`

---

## ✅ **Verification Checklist**

- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] Both variables enabled for Production, Preview, Development
- [ ] App redeployed after adding variables
- [ ] Test endpoint works: `/api/test-supabase`

---

## 🐛 **If It's Not Working**

1. **Check variable names** - Must be exactly:
   - `NEXT_PUBLIC_SUPABASE_URL` (not `NEXT_PUBLIC_SUPABASE_URL_` or similar)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (case-sensitive)

2. **Check environments** - Variables must be enabled for the environment you're using

3. **Redeploy** - Changes only take effect after redeployment

4. **Check build logs** - Look for errors in Vercel deployment logs

---

**🔗 Quick Links:**
- Environment Variables: https://vercel.com/berbers-projects-eb2c67b0/ingfi/settings/environment-variables
- Deployments: https://vercel.com/berbers-projects-eb2c67b0/ingfi/deployments
- Project Dashboard: https://vercel.com/berbers-projects-eb2c67b0/ingfi

