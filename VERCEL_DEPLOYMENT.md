# 🚀 Vercel Deployment Instructions

Your Vercel project: https://vercel.com/berbers-projects-eb2c67b0/ingfi

---

## ✅ **Step 1: Push Code to Git**

If you haven't pushed yet:

```bash
git push origin main
```

This will automatically trigger a Vercel deployment if your repository is connected.

---

## 🔑 **Step 2: Set Environment Variables in Vercel**

**Critical:** You must set these environment variables in Vercel:

1. Go to: https://vercel.com/berbers-projects-eb2c67b0/ingfi/settings/environment-variables

2. Add these variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://hsdldrvsanmviuawdckp.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZGxkcnZzYW5tdml1YXdkY2twIiwicm9sZSI6ImFub24iLCJpY3QiOjE3NjMzODY2NDQsImV4cCI6MjA3ODk2MjY0NH0.H3NYRqk0aWMJ0dlxAWV8ka13nubTFSa9Z-ElU6buDAQ`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. Click **Save** for each variable

---

## 🔄 **Step 3: Trigger Deployment**

### Option A: Automatic (Recommended)
- Push to your main branch:
  ```bash
  git push origin main
  ```
- Vercel will automatically detect and deploy

### Option B: Manual Deploy
1. Go to: https://vercel.com/berbers-projects-eb2c67b0/ingfi
2. Click **Deployments** tab
3. Click **Redeploy** on latest deployment
4. Or click **Create Deployment**

---

## ✅ **Step 4: Verify Deployment**

1. **Check Build Logs:**
   - Go to your deployment
   - Click on the deployment
   - Check **Build Logs** for any errors

2. **Test Supabase Connection:**
   - Visit: `https://your-app.vercel.app/api/test-supabase`
   - Should return: `{"success": true, "tables": "ready"}`

3. **Test App:**
   - Visit your deployed URL
   - Test login
   - Test job creation

---

## 🐛 **Troubleshooting**

### Build Fails
- Check environment variables are set correctly
- Verify variable names match exactly (case-sensitive)
- Check build logs in Vercel dashboard

### Supabase Connection Fails
- Verify environment variables are set
- Check Supabase project is active
- Test connection endpoint: `/api/test-supabase`

### Environment Variables Not Working
- Make sure variables are set for all environments (Production, Preview, Development)
- Redeploy after adding variables
- Check variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📝 **Quick Commands**

```bash
# Push and trigger deployment
git push origin main

# Check deployment status
vercel ls

# View logs
vercel logs
```

---

## 🔗 **Useful Links**

- **Project Dashboard:** https://vercel.com/berbers-projects-eb2c67b0/ingfi
- **Environment Variables:** https://vercel.com/berbers-projects-eb2c67b0/ingfi/settings/environment-variables
- **Deployments:** https://vercel.com/berbers-projects-eb2c67b0/ingfi/deployments

---

**🚀 Ready to deploy!**

