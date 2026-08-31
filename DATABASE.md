# ResumeIQ — Database Design & Migrations

## 1. Relational Schema Design

```
             auth.users (Supabase Managed)
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
      profiles            resumes
     (1-to-1)           (1-to-Many)
                             │
                             ▼
                          analyses
                        (1-to-Many)
```

---

## 2. Table Specifications

### `public.profiles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, FK -> `auth.users(id)` ON DELETE CASCADE | Profile owner |
| `full_name` | TEXT | NULLABLE | User display name |
| `email` | TEXT | NOT NULL | User email |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT `now()` | Last modified timestamp |

### `public.resumes`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Unique resume ID |
| `user_id` | UUID | NOT NULL, FK -> `auth.users(id)` ON DELETE CASCADE | Owner ID |
| `file_name` | TEXT | NOT NULL | Original PDF file name |
| `storage_path` | TEXT | NOT NULL | Supabase Storage path |
| `extracted_text`| TEXT | NULLABLE | Extracted plain text content |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` | Upload timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT `now()` | Update timestamp |

### `public.analyses`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Unique analysis ID |
| `user_id` | UUID | NOT NULL, FK -> `auth.users(id)` ON DELETE CASCADE | Owner ID |
| `resume_id` | UUID | NOT NULL, FK -> `public.resumes(id)` ON DELETE CASCADE | Analyzed resume ID |
| `job_title` | TEXT | NOT NULL | Target job title |
| `job_description`| TEXT | NOT NULL | Target job description text |
| `overall_score` | INTEGER | CHECK (overall_score BETWEEN 0 AND 100) | Final weighted score |
| `skills_score` | INTEGER | CHECK (skills_score BETWEEN 0 AND 100) | Deterministic skills score |
| `experience_score`| INTEGER| CHECK (experience_score BETWEEN 0 AND 100) | AI experience score |
| `keyword_score`| INTEGER | CHECK (keyword_score BETWEEN 0 AND 100) | Deterministic keyword score |
| `education_score`| INTEGER| CHECK (education_score BETWEEN 0 AND 100) | AI education score |
| `quality_score`| INTEGER | CHECK (quality_score BETWEEN 0 AND 100) | AI quality score |
| `status` | TEXT | NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')) | Analysis progress status |
| `result_json` | JSONB | NULLABLE | Complete structured result |
| `error_message`| TEXT | NULLABLE | Failure error description |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` | Timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT `now()` | Timestamp |

---

## 3. Database Indexes
```sql
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_resume_id ON public.analyses(resume_id);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);
```

---

## 4. SQL Migration Scripts

### Step 1: Core Schema & Constraints
```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Analyses table
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  skills_score INTEGER CHECK (skills_score BETWEEN 0 AND 100),
  experience_score INTEGER CHECK (experience_score BETWEEN 0 AND 100),
  keyword_score INTEGER CHECK (keyword_score BETWEEN 0 AND 100),
  education_score INTEGER CHECK (education_score BETWEEN 0 AND 100),
  quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result_json JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_resume_id ON public.analyses(resume_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);

-- Trigger: auto update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_resumes
  BEFORE UPDATE ON public.resumes FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_analyses
  BEFORE UPDATE ON public.analyses FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Trigger: create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 2: Granular Row Level Security (RLS)
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Resumes policies
CREATE POLICY "resumes_select_own" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "resumes_insert_own" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resumes_update_own" ON public.resumes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resumes_delete_own" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- Analyses policies
CREATE POLICY "analyses_select_own" ON public.analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "analyses_insert_own" ON public.analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analyses_update_own" ON public.analyses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analyses_delete_own" ON public.analyses FOR DELETE USING (auth.uid() = user_id);
```

### Step 3: Storage Bucket Policies
```sql
-- Storage bucket 'resumes'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resumes', 'resumes', false, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf'];

-- Storage RLS
CREATE POLICY "resumes_storage_upload" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "resumes_storage_read" ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "resumes_storage_delete" ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);
```
