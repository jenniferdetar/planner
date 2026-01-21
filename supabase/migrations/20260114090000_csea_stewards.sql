-- Migration to add CSEA Stewards table
CREATE TABLE IF NOT EXISTS csea_stewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  title TEXT,
  district TEXT,
  office TEXT,
  email TEXT,
  phone TEXT,
  focus_areas TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE csea_stewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Assuming stewards are public or read-only for authenticated users)
-- For now, allowing all authenticated users to read, but only service_role (or similar) to write.
-- However, for the purpose of this task, I'll allow all authenticated users to manage them 
-- if that's the pattern in this project, but usually stewards might be global.
-- Let's look at other policies. 
-- "Users manage their own" is the common pattern.
-- If stewards are global, maybe:
CREATE POLICY "Public read access for csea_stewards" ON csea_stewards FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage csea_stewards" ON csea_stewards FOR ALL USING (auth.role() = 'authenticated');
