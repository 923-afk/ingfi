# Data Storage Guide for Client

## 📊 Current Implementation (Prototype)

### How Data is Currently Stored

The app currently uses **browser localStorage** for data persistence. This is suitable for prototypes but **NOT for production** with multiple users.

#### Current Storage Locations:

1. **Jobs Data** (`useJobs` hook)
   - **Storage Key**: `engineer-finder-jobs`
   - **Location**: `src/hooks/useJobs.ts`
   - **What's Stored**: All job requests
   - **Format**: JSON array of `JobRequest` objects

2. **User Authentication** (`AuthContext`)
   - **Storage Key**: `engineer-finder-auth`
   - **Location**: `src/context/AuthContext.tsx`
   - **What's Stored**: Current logged-in user
   - **Format**: JSON `AuthUser` object

3. **Language Preference**
   - **Storage Key**: `engineer-finder-locale`
   - **What's Stored**: Selected language (zh/en/de)
   - **Format**: String

4. **Todos** (if using todos page)
   - **Storage Key**: `engineer-finder-todos`
   - **Location**: `src/app/todos/page.tsx`
   - **What's Stored**: User's todo list
   - **Format**: JSON array of `Todo` objects

---

## ⚠️ **Limitations of Current Approach**

### ❌ **NOT Suitable for Production:**

1. **Browser-Only Storage**
   - Data only exists in user's browser
   - Lost if user clears browser data
   - Not accessible from other devices

2. **No User Isolation**
   - All users see the same data (if sharing device)
   - No user-specific data separation

3. **No Server-Side Validation**
   - All validation is client-side only
   - Can be bypassed by tech-savvy users

4. **No Real-Time Sync**
   - Changes don't sync across devices
   - No collaboration features

5. **Limited Storage**
   - localStorage has ~5-10MB limit
   - Can run out of space

---

## 🚀 **Production Solution: Backend Database**

### Recommended Architecture

```
┌─────────────┐
│   Client    │  (Next.js Frontend)
│  (Browser)  │
└──────┬──────┘
       │ HTTP/HTTPS
       │ REST API or GraphQL
       ▼
┌─────────────┐
│   Backend   │  (Next.js API Routes or Separate Server)
│    Server   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │  (PostgreSQL, MongoDB, etc.)
│             │
└─────────────┘
```

---

## 📋 **Implementation Options**

### Option 1: Next.js API Routes + Database (Recommended)

#### Step 1: Create API Routes

Create `src/app/api/` directory:

```
src/app/api/
├── jobs/
│   ├── route.ts          # GET /api/jobs, POST /api/jobs
│   └── [id]/
│       └── route.ts      # GET /api/jobs/[id], PUT, DELETE
├── professionals/
│   └── route.ts          # GET /api/professionals
└── auth/
    └── route.ts          # POST /api/auth/login
```

#### Step 2: Choose Database

**Option A: PostgreSQL (Recommended for relational data)**
```bash
npm install @prisma/client prisma
npm install pg  # or use Prisma with PostgreSQL
```

**Option B: MongoDB (Good for flexible schemas)**
```bash
npm install mongodb
# or
npm install mongoose
```

**Option C: Supabase (Easiest setup)**
```bash
npm install @supabase/supabase-js
```

#### Step 3: Update useJobs Hook

Replace localStorage with API calls:

```typescript
// src/hooks/useJobs.ts
export function useJobs() {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from API instead of localStorage
  useEffect(() => {
    async function loadJobs() {
      try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error('Failed to load jobs:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadJobs();
  }, []);

  const addJob = async (job: JobRequest) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      });
      const newJob = await response.json();
      setJobs((prev) => [newJob, ...prev]);
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
    }
  };

  // Similar for updateJob, deleteJob...
  
  return { jobs, isLoading, addJob, updateJob, deleteJob };
}
```

---

### Option 2: Supabase (Quickest Setup)

#### Step 1: Setup Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get API keys

#### Step 2: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

#### Step 3: Create Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

#### Step 4: Create Database Tables

In Supabase SQL Editor:

```sql
-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  preferred_schedule TEXT NOT NULL,
  budget_range TEXT,
  urgency TEXT NOT NULL,
  status TEXT NOT NULL,
  assigned_professional_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Professionals table
CREATE TABLE professionals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trade TEXT NOT NULL,
  years_of_experience INTEGER,
  rating DECIMAL,
  completed_jobs INTEGER,
  -- ... other fields
);

-- Timeline entries table
CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  summary_zh TEXT,
  summary_en TEXT,
  summary_de TEXT,
  date TIMESTAMP NOT NULL
);
```

#### Step 5: Update useJobs Hook

```typescript
// src/hooks/useJobs.ts
import { supabase } from '@/lib/supabase';

export function useJobs() {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, timeline_entries(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading jobs:', error);
      } else {
        setJobs(data || []);
      }
      setIsLoading(false);
    }
    loadJobs();
  }, []);

  const addJob = async (job: JobRequest) => {
    const { data, error } = await supabase
      .from('jobs')
      .insert(job)
      .select()
      .single();

    if (error) throw error;
    setJobs((prev) => [data, ...prev]);
    return data;
  };

  // ... other methods
}
```

---

### Option 3: Firebase (Google)

#### Step 1: Setup Firebase

1. Create project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database
3. Get config keys

#### Step 2: Install Firebase

```bash
npm install firebase
```

#### Step 3: Initialize Firebase

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

---

## 🔐 **Authentication for Production**

### Replace Demo Auth with Real Auth

**Option 1: NextAuth.js (Recommended)**

```bash
npm install next-auth
```

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Check against database
        const user = await db.users.findByEmail(credentials.email);
        if (user && await verifyPassword(credentials.password, user.password)) {
          return { id: user.id, email: user.email, name: user.name };
        }
        return null;
      }
    })
  ],
  // ... other config
};

export default NextAuth(authOptions);
```

**Option 2: Supabase Auth**

Already included with Supabase - handles authentication automatically.

---

## 📝 **Migration Steps**

### Step 1: Setup Backend
1. Choose database solution
2. Create database tables
3. Setup authentication

### Step 2: Create API Routes
1. Create `/api/jobs` endpoints
2. Create `/api/professionals` endpoints
3. Create `/api/auth` endpoints

### Step 3: Update Hooks
1. Replace localStorage with API calls
2. Add error handling
3. Add loading states

### Step 4: Migrate Existing Data (if any)
1. Export localStorage data
2. Import into database
3. Verify data integrity

### Step 5: Test
1. Test all CRUD operations
2. Test authentication
3. Test error scenarios

---

## 🎯 **Recommended Stack for Production**

### For Small to Medium Projects:
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Backend**: Next.js API Routes
- **Authentication**: Supabase Auth or NextAuth.js

### For Large Projects:
- **Database**: PostgreSQL (self-hosted or managed)
- **Backend**: Next.js API Routes or separate Node.js server
- **Authentication**: NextAuth.js with JWT
- **Caching**: Redis (optional)
- **File Storage**: AWS S3 or Cloudinary

---

## 📊 **Data Models**

### Jobs Table Schema
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(500) NOT NULL,
  preferred_schedule VARCHAR(255) NOT NULL,
  budget_range VARCHAR(100),
  urgency VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  assigned_professional_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Professionals Table Schema
```sql
CREATE TABLE professionals (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  trade VARCHAR(255) NOT NULL,
  years_of_experience INTEGER,
  rating DECIMAL(3,2),
  completed_jobs INTEGER DEFAULT 0,
  verification_level VARCHAR(20),
  verified_at TIMESTAMP,
  -- ... other fields
);
```

---

## 🔄 **Current vs Production Comparison**

| Feature | Current (localStorage) | Production (Database) |
|---------|----------------------|----------------------|
| **Storage Location** | Browser only | Server database |
| **Data Persistence** | Lost on clear | Permanent |
| **Multi-Device** | ❌ No | ✅ Yes |
| **User Isolation** | ❌ No | ✅ Yes |
| **Real-time Updates** | ❌ No | ✅ Yes (with WebSockets) |
| **Data Validation** | Client-side only | Server-side |
| **Scalability** | Limited | Unlimited |
| **Backup** | Manual | Automatic |

---

## 🚀 **Quick Start: Supabase Setup**

1. **Create Supabase Project**
   ```bash
   # Visit supabase.com and create project
   ```

2. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Add Environment Variables**
   ```env
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Create Database Tables** (use SQL Editor in Supabase)

5. **Update useJobs Hook** (replace localStorage with Supabase calls)

6. **Test** - Create a job and verify it appears in Supabase dashboard

---

## 📚 **Additional Resources**

- [Next.js API Routes Docs](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)

---

## ⚠️ **Important Notes**

1. **Never store sensitive data in localStorage**
2. **Always validate on server-side**
3. **Use environment variables for API keys**
4. **Implement proper error handling**
5. **Add rate limiting for API endpoints**
6. **Use HTTPS in production**
7. **Implement proper authentication**
8. **Backup database regularly**

---

**Current Status**: Using localStorage (prototype only)
**Production Ready**: Requires backend database setup
**Recommended Next Step**: Choose database solution and create API routes

