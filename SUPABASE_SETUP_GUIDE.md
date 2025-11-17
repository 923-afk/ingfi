# Supabase Setup Guide - Step by Step

## 🚀 **Quick Start: Get Supabase Running in 10 Minutes**

Follow these steps to set up Supabase for your Engineer Finder app.

---

## Step 1: Create Supabase Account (2 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Click "New Project"
5. Fill in:
   - **Name**: Engineer Finder (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (to start)
6. Click "Create new project"
7. Wait 2-3 minutes for setup

---

## Step 2: Get Your Credentials (1 minute)

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
3. Save them somewhere safe (you'll need them)

---

## Step 3: Install Supabase in Your Project (1 minute)

```bash
npm install @supabase/supabase-js
```

---

## Step 4: Create Environment Variables (2 minutes)

1. Create `.env.local` file in project root (if not exists)
2. Add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

3. **Important**: `.env.local` is already in `.gitignore` ✅

---

## Step 5: Create Supabase Client (2 minutes)

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Step 6: Create Database Tables (5 minutes)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the SQL from `SECURE_STORAGE_SETUP.md` (Step 6)
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. Wait for "Success" message

**Tables created:**
- ✅ `jobs` - Job requests
- ✅ `timeline_entries` - Job timeline
- ✅ `professionals` - Professional profiles
- ✅ `user_profiles` - User information

---

## Step 7: Test Connection (1 minute)

Create a test file `src/app/api/test-supabase/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase.from('jobs').select('count');
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connected successfully!',
      data 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Connection failed',
      details: String(error) 
    }, { status: 500 });
  }
}
```

Test it:
```bash
npm run dev
# Visit: http://localhost:3000/api/test-supabase
```

Should see: `{"success": true, "message": "Supabase connected successfully!"}`

---

## Step 8: Update useJobs Hook (10 minutes)

Replace `src/hooks/useJobs.ts` with the Supabase version from `SECURE_STORAGE_SETUP.md` (Step 7).

**Key changes:**
- Remove localStorage code
- Add Supabase queries
- Add error handling
- Add real-time subscriptions

---

## Step 9: Update Authentication (10 minutes)

Replace `src/context/AuthContext.tsx` with the Supabase version from `SECURE_STORAGE_SETUP.md` (Step 8).

**Key changes:**
- Remove demo users
- Add Supabase auth
- Add signup function
- Add session management

---

## Step 10: Test Everything (5 minutes)

1. **Test Login:**
   - Create a test user in Supabase Dashboard → Authentication
   - Try logging in

2. **Test Job Creation:**
   - Create a job
   - Check Supabase Dashboard → Table Editor → jobs
   - Should see your job!

3. **Test Data Persistence:**
   - Create a job
   - Refresh page
   - Job should still be there!

---

## ✅ **Setup Checklist**

- [ ] Supabase account created
- [ ] Project created
- [ ] Credentials saved
- [ ] `@supabase/supabase-js` installed
- [ ] `.env.local` created with credentials
- [ ] `src/lib/supabase.ts` created
- [ ] Database tables created (SQL executed)
- [ ] Test connection works
- [ ] `useJobs` hook updated
- [ ] `AuthContext` updated
- [ ] Login tested
- [ ] Job creation tested
- [ ] Data persistence verified

---

## 🐛 **Troubleshooting**

### Error: "Missing Supabase environment variables"
- Check `.env.local` exists
- Check variable names are correct
- Restart dev server: `npm run dev`

### Error: "relation does not exist"
- Tables not created yet
- Go to SQL Editor and run the schema SQL

### Error: "new row violates row-level security policy"
- RLS policies are working (good!)
- Make sure user is authenticated
- Check RLS policies in Dashboard → Authentication → Policies

### Can't connect to Supabase
- Check internet connection
- Check Project URL is correct
- Check anon key is correct
- Check Supabase status: status.supabase.com

---

## 📚 **Next Steps**

1. ✅ **Read**: `SECURE_STORAGE_SETUP.md` for detailed implementation
2. ✅ **Read**: `SUPABASE_PRICING_UNKNOWN_USERS.md` for cost info
3. ✅ **Read**: `SUPABASE_DOWNTIME_STRATEGY.md` for reliability
4. ✅ **Read**: `SUPABASE_DATA_LOSS_PREVENTION.md` for backups

---

## 🎯 **You're Ready!**

Once you complete these steps, your app will:
- ✅ Store data in Supabase (not localStorage)
- ✅ Have real authentication
- ✅ Support multiple users
- ✅ Have automatic backups
- ✅ Be production-ready!

**Estimated Time**: 30-45 minutes total

**Need Help?** Check the detailed guides or Supabase docs: https://supabase.com/docs

