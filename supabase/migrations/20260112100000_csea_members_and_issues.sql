-- Migration to add CSEA Members and CSEA Issues tables

-- CSEA Members
CREATE TABLE IF NOT EXISTS csea_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id TEXT, -- The external member ID (e.g., from CSV)
  first_name TEXT,
  last_name TEXT,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, member_id)
);

-- CSEA Issues (The Issue Log)
CREATE TABLE IF NOT EXISTS csea_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID REFERENCES csea_members(id) ON DELETE SET NULL,
  issue_type TEXT CHECK (issue_type IN ('Grievance', 'Gripe', 'Complaint')),
  description TEXT,
  steward TEXT,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')),
  status TEXT CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
  issue_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE csea_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE csea_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage their own csea_members" ON csea_members FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own csea_issues" ON csea_issues FOR ALL USING (auth.uid() = user_id);

-- Updated at triggers (if desired, but we'll stick to basic schema for now as per project conventions)
