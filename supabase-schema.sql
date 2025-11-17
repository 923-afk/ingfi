-- Supabase Database Schema for Engineer Finder App
-- Run this in Supabase Dashboard → SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'professional')),
  professional_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
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

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- TIMELINE ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS timeline_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('建立工單', '更新', '訊息', '照片', '完工')),
  summary_zh TEXT,
  summary_en TEXT,
  summary_de TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- PROFESSIONALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS professionals (
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

-- Enable Row Level Security
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Professionals are public (read-only for all authenticated users)
CREATE POLICY "Anyone can view professionals"
  ON professionals FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_job_id ON timeline_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON jobs
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at 
  BEFORE UPDATE ON professionals
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '✅ Tables: user_profiles, jobs, timeline_entries, professionals';
  RAISE NOTICE '✅ Row Level Security enabled';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ Triggers set up';
END $$;

