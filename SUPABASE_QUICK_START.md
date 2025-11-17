# Supabase Quick Start Checklist

## ✅ **5-Minute Setup**

### Step 1: Create Supabase Project (2 min)
1. Go to [supabase.com](https://supabase.com)
2. Sign up / Login
3. Click "New Project"
4. Fill in:
   - Name: `Engineer Finder`
   - Database Password: (create strong password, save it!)
   - Region: (choose closest)
   - Plan: **Free**
5. Click "Create new project"
6. Wait 2-3 minutes

### Step 2: Get Credentials (1 min)
1. Dashboard → **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

### Step 3: Install & Configure (2 min)

```bash
# Install (already done if you ran the command)
npm install @supabase/supabase-js

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local and add your credentials
```

**File created**: `src/lib/supabase.ts` ✅

### Step 4: Create Database Tables (2 min)
1. Supabase Dashboard → **SQL Editor**
2. Click "New query"
3. Open `supabase-schema.sql` file
4. Copy ALL the SQL
5. Paste into SQL Editor
6. Click "Run" (or Cmd/Ctrl + Enter)
7. Should see: "✅ Database schema created successfully!"

### Step 5: Test Connection (1 min)

```bash
npm run dev
```

Visit: `http://localhost:3000/api/test-supabase`

Should see: `{"success": true}`

---

## 🔄 **Next: Update Your Code**

### Files to Update:

1. **`src/hooks/useJobs.ts`**
   - Replace with Supabase version
   - See: `SECURE_STORAGE_SETUP.md` → Step 7

2. **`src/context/AuthContext.tsx`**
   - Replace with Supabase auth
   - See: `SECURE_STORAGE_SETUP.md` → Step 8

3. **Test everything!**
   - Create account
   - Create job
   - Verify in Supabase Dashboard

---

## 📋 **Setup Checklist**

- [ ] Supabase account created
- [ ] Project created
- [ ] Credentials copied
- [ ] `.env.local` created with credentials
- [ ] `@supabase/supabase-js` installed
- [ ] `src/lib/supabase.ts` exists
- [ ] Database tables created (SQL executed)
- [ ] Test connection works
- [ ] `useJobs` hook updated
- [ ] `AuthContext` updated
- [ ] Login tested
- [ ] Job creation tested

---

## 🎯 **You're Done!**

Your app now uses Supabase! 🎉

**Next**: Follow `SECURE_STORAGE_SETUP.md` for full implementation details.

