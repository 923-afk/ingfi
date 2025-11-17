# Secure Data Storage Setup Guide

## 🔒 **Recommended: Supabase (Most Secure & Easiest)**

Supabase is the **safest and easiest** option because:
- ✅ **Enterprise-grade security** (SOC 2, HIPAA ready)
- ✅ **Built-in authentication** (no need to build from scratch)
- ✅ **Row Level Security (RLS)** - automatic data isolation
- ✅ **Automatic backups**
- ✅ **HTTPS by default**
- ✅ **GDPR compliant**
- ✅ **Free tier available**
- ✅ **Managed service** (no server maintenance)

---

## 🚀 **Step-by-Step Secure Setup**

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up (free tier is sufficient for start)
3. Create new project
4. Wait for database to initialize (~2 minutes)

### Step 2: Get Your Credentials

In Supabase Dashboard → Settings → API:
- Copy **Project URL**
- Copy **anon/public key** (for client-side)
- Copy **service_role key** (keep secret! Only for server-side)

### Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Step 4: Create Environment Variables

Create `.env.local` file (add to `.gitignore`):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-side only (for API routes)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ IMPORTANT**: Never commit `.env.local` to git!

### Step 5: Create Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (for API routes only)
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

### Step 6: Create Secure Database Schema

In Supabase Dashboard → SQL Editor, run:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create jobs table with security
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(500) NOT NULL,
  preferred_schedule VARCHAR(255) NOT NULL,
  budget_range VARCHAR(100),
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('一般', '急件')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('草稿', '媒合中', '已指派', '施工中', '待驗收', '已結案', '已取消')),
  assigned_professional_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timeline entries table
CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  kind VARCHAR(20) NOT NULL,
  summary_zh TEXT,
  summary_en TEXT,
  summary_de TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create professionals table
CREATE TABLE professionals (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  trade VARCHAR(255) NOT NULL,
  years_of_experience INTEGER,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  completed_jobs INTEGER DEFAULT 0,
  certifications TEXT[],
  service_areas TEXT[],
  availability TEXT,
  introduction TEXT,
  verification_level VARCHAR(20) CHECK (verification_level IN ('pending', 'basic', 'enhanced')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;

-- Security Policy: Users can only see their own jobs
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Security Policy: Users can view timeline for their jobs
CREATE POLICY "Users can view timeline for own jobs"
  ON timeline_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = timeline_entries.job_id
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert timeline for own jobs"
  ON timeline_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = timeline_entries.job_id
      AND jobs.user_id = auth.uid()
    )
  );

-- Professionals are public (read-only for all authenticated users)
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view professionals"
  ON professionals FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_timeline_job_id ON timeline_entries(job_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 7: Update useJobs Hook (Secure Version)

```typescript
// src/hooks/useJobs.ts
import { useState, useEffect, useCallback } from 'react';
import type { JobRequest } from '@/types/job';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function useJobs() {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load jobs from Supabase
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function loadJobs() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch jobs with timeline entries
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            timeline_entries (
              id,
              kind,
              summary_zh,
              summary_en,
              summary_de,
              date
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        // Transform data to match JobRequest type
        const transformedJobs: JobRequest[] = (jobsData || []).map((job: any) => ({
          id: job.id,
          title: job.title,
          category: job.category,
          description: job.description,
          location: job.location,
          preferredSchedule: job.preferred_schedule,
          budgetRange: job.budget_range,
          urgency: job.urgency,
          status: job.status,
          assignedProfessionalId: job.assigned_professional_id,
          timeline: (job.timeline_entries || []).map((entry: any) => ({
            id: entry.id,
            kind: entry.kind,
            summary: {
              zh: entry.summary_zh,
              en: entry.summary_en,
              de: entry.summary_de,
            },
            date: entry.date,
          })),
        }));

        setJobs(transformedJobs);
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setError('Failed to load jobs');
      } finally {
        setIsLoading(false);
      }
    }

    loadJobs();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          loadJobs(); // Reload on changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addJob = useCallback(
    async (job: JobRequest) => {
      if (!user) throw new Error('User not authenticated');

      try {
        // Insert job
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .insert({
            user_id: user.id,
            title: job.title,
            category: job.category,
            description: job.description,
            location: job.location,
            preferred_schedule: job.preferredSchedule,
            budget_range: job.budgetRange,
            urgency: job.urgency,
            status: job.status,
            assigned_professional_id: job.assignedProfessionalId,
          })
          .select()
          .single();

        if (jobError) throw jobError;

        // Insert timeline entries
        if (job.timeline && job.timeline.length > 0) {
          const { error: timelineError } = await supabase.from('timeline_entries').insert(
            job.timeline.map((entry) => ({
              job_id: jobData.id,
              kind: entry.kind,
              summary_zh: entry.summary.zh,
              summary_en: entry.summary.en,
              summary_de: entry.summary.de,
              date: entry.date,
            }))
          );

          if (timelineError) throw timelineError;
        }

        // Reload jobs
        const { data: updatedJobs } = await supabase
          .from('jobs')
          .select('*, timeline_entries(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (updatedJobs) {
          // Transform and set jobs
          const transformed = updatedJobs.map((j: any) => ({
            id: j.id,
            title: j.title,
            category: j.category,
            description: j.description,
            location: j.location,
            preferredSchedule: j.preferred_schedule,
            budgetRange: j.budget_range,
            urgency: j.urgency,
            status: j.status,
            assignedProfessionalId: j.assigned_professional_id,
            timeline: (j.timeline_entries || []).map((e: any) => ({
              id: e.id,
              kind: e.kind,
              summary: { zh: e.summary_zh, en: e.summary_en, de: e.summary_de },
              date: e.date,
            })),
          }));
          setJobs(transformed);
        }
      } catch (err) {
        console.error('Failed to create job:', err);
        throw err;
      }
    },
    [user]
  );

  const updateJob = useCallback(
    async (id: string, updates: Partial<JobRequest>) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const updateData: any = {};
        if (updates.title) updateData.title = updates.title;
        if (updates.status) updateData.status = updates.status;
        if (updates.assignedProfessionalId !== undefined)
          updateData.assigned_professional_id = updates.assignedProfessionalId;

        const { error } = await supabase.from('jobs').update(updateData).eq('id', id).eq('user_id', user.id);

        if (error) throw error;

        // If timeline updates, handle separately
        if (updates.timeline) {
          // Delete existing timeline entries
          await supabase.from('timeline_entries').delete().eq('job_id', id);

          // Insert new timeline entries
          if (updates.timeline.length > 0) {
            const { error: timelineError } = await supabase.from('timeline_entries').insert(
              updates.timeline.map((entry) => ({
                job_id: id,
                kind: entry.kind,
                summary_zh: entry.summary.zh,
                summary_en: entry.summary.en,
                summary_de: entry.summary.de,
                date: entry.date,
              }))
            );
            if (timelineError) throw timelineError;
          }
        }

        // Reload jobs
        const { data } = await supabase
          .from('jobs')
          .select('*, timeline_entries(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          const transformed = data.map((j: any) => ({
            id: j.id,
            title: j.title,
            category: j.category,
            description: j.description,
            location: j.location,
            preferredSchedule: j.preferred_schedule,
            budgetRange: j.budget_range,
            urgency: j.urgency,
            status: j.status,
            assignedProfessionalId: j.assigned_professional_id,
            timeline: (j.timeline_entries || []).map((e: any) => ({
              id: e.id,
              kind: e.kind,
              summary: { zh: e.summary_zh, en: e.summary_en, de: e.summary_de },
              date: e.date,
            })),
          }));
          setJobs(transformed);
        }
      } catch (err) {
        console.error('Failed to update job:', err);
        throw err;
      }
    },
    [user]
  );

  const deleteJob = useCallback(
    async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const { error } = await supabase.from('jobs').delete().eq('id', id).eq('user_id', user.id);
        if (error) throw error;

        setJobs((prev) => prev.filter((job) => job.id !== id));
      } catch (err) {
        console.error('Failed to delete job:', err);
        throw err;
      }
    },
    [user]
  );

  return {
    jobs,
    isLoading,
    error,
    addJob,
    updateJob,
    deleteJob,
  };
}
```

### Step 8: Update Authentication (Secure)

```typescript
// src/context/AuthContext.tsx
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'professional';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  professionalId?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(supabaseUser: User) {
    try {
      // Fetch user profile from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: data.name || supabaseUser.email!.split('@')[0],
        role: data.role || 'customer',
        professionalId: data.professional_id,
      });
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // Fallback to basic user info
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.email!.split('@')[0],
        role: 'customer',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }

      return {};
    } catch (err) {
      return { error: 'Login failed. Please try again.' };
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string, role: UserRole) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
            },
          },
        });

        if (error) {
          return { error: error.message };
        }

        // Create user profile
        if (data.user) {
          const { error: profileError } = await supabase.from('user_profiles').insert({
            id: data.user.id,
            name,
            role,
            email,
          });

          if (profileError) {
            console.error('Failed to create profile:', profileError);
          }
        }

        return {};
      } catch (err) {
        return { error: 'Signup failed. Please try again.' };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, isLoading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
```

### Step 9: Create User Profiles Table

```sql
-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'professional')),
  professional_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## 🔐 **Security Features Included**

✅ **Row Level Security (RLS)** - Users can only access their own data
✅ **Encrypted connections** - HTTPS by default
✅ **Secure authentication** - Supabase Auth handles passwords securely
✅ **Input validation** - Database constraints prevent invalid data
✅ **SQL injection protection** - Supabase client handles parameterization
✅ **Automatic backups** - Supabase handles backups
✅ **Environment variables** - Secrets stored securely
✅ **User isolation** - Each user's data is completely separate

---

## 📋 **Security Checklist**

- [x] Row Level Security enabled
- [x] Environment variables for secrets
- [x] HTTPS connections only
- [x] Input validation at database level
- [x] User authentication required
- [x] Data isolation per user
- [x] No sensitive data in client code
- [x] Secure password handling (Supabase manages this)

---

## 🚀 **Quick Start Commands**

```bash
# 1. Install Supabase
npm install @supabase/supabase-js

# 2. Create .env.local (don't commit this!)
# Add your Supabase credentials

# 3. Run SQL schema in Supabase dashboard

# 4. Update useJobs hook
# Replace localStorage with Supabase calls

# 5. Update AuthContext
# Replace demo auth with Supabase auth

# 6. Test!
npm run dev
```

---

## ⚠️ **Important Security Notes**

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Never expose service_role key** - Only use in server-side code
3. **Always use RLS policies** - Don't disable Row Level Security
4. **Validate on server** - Don't trust client-side validation alone
5. **Use HTTPS** - Supabase enforces this automatically
6. **Regular backups** - Supabase handles this, but verify
7. **Monitor access** - Check Supabase logs regularly

---

## 🎯 **Why This is the Safest Option**

1. **Enterprise Security**: SOC 2 Type II certified
2. **Managed Service**: Security updates handled automatically
3. **Built-in Auth**: Industry-standard authentication
4. **Row Level Security**: Automatic data isolation
5. **Encryption**: Data encrypted at rest and in transit
6. **Compliance**: GDPR, HIPAA ready
7. **No Server Management**: No security patches to apply
8. **Audit Logs**: Built-in logging and monitoring

---

**This is the most secure option for production use!** 🔒

