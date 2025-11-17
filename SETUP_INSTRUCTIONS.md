# Supabase Setup Instructions

## ✅ **Step 1: Environment Variables - DONE!**

Your `.env.local` file has been created with your Supabase credentials:
- ✅ Project URL: `https://hsdldrvsanmviuawdckp.supabase.co`
- ✅ Anon Key: Configured

---

## 🚀 **Step 2: Create Database Tables (5 minutes)**

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/hsdldrvsanmviuawdckp
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open the file `supabase-schema.sql` in your project
5. **Copy ALL the SQL code** (from the file)
6. **Paste it into the SQL Editor**
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. You should see: "✅ Database schema created successfully!"

### Option B: Using Supabase CLI (Advanced)

```bash
# If you have Supabase CLI installed
supabase db push
```

---

## 🧪 **Step 3: Test Connection (1 minute)**

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/api/test-supabase`

3. **Expected Result:**
   ```json
   {
     "success": true,
     "message": "Supabase connected successfully!",
     "connection": "working",
     "tables": "ready"
   }
   ```

   If you see this, you're connected! ✅

   If you see "Tables not created yet", that's okay - just run Step 2 first.

---

## 📋 **Step 4: Update Your Code**

### Update useJobs Hook

Replace `src/hooks/useJobs.ts` with the Supabase version. See `SECURE_STORAGE_SETUP.md` Step 7 for the complete code.

### Update AuthContext

Replace `src/context/AuthContext.tsx` with the Supabase version. See `SECURE_STORAGE_SETUP.md` Step 8 for the complete code.

---

## ✅ **Quick Checklist**

- [x] Supabase project created
- [x] Credentials configured in `.env.local`
- [ ] Database tables created (run SQL schema)
- [ ] Test connection works
- [ ] `useJobs` hook updated
- [ ] `AuthContext` updated
- [ ] Login tested
- [ ] Job creation tested

---

## 🎯 **Next Steps After Setup**

1. **Create a test user:**
   - Supabase Dashboard → Authentication → Users
   - Click "Add user" → Create user with email/password

2. **Test login:**
   - Use the test user credentials
   - Should work with Supabase auth

3. **Create a job:**
   - Create a job in your app
   - Check Supabase Dashboard → Table Editor → jobs
   - Should see your job!

4. **Verify data persistence:**
   - Create a job
   - Refresh page
   - Job should still be there!

---

## 🆘 **Troubleshooting**

### "Missing Supabase environment variables"
- ✅ Already fixed - `.env.local` is created
- Restart dev server: `npm run dev`

### "relation does not exist"
- Tables not created yet
- Run Step 2 (create database tables)

### "new row violates row-level security policy"
- RLS is working (good!)
- Make sure user is authenticated
- Check you're using the correct user_id

### Connection test fails
- Check `.env.local` has correct values
- Check Supabase project is active
- Check internet connection

---

**You're almost there! Just run the SQL schema and you're ready!** 🚀

