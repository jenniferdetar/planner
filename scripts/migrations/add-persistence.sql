-- Migration: Add Work Planner Persistence Tables
-- This allows syncing editable fields across browsers/machines.

-- 1. Table for specific 30-min slot edits
CREATE TABLE IF NOT EXISTS work_planner_edits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_key TEXT NOT NULL,
  slot_key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  -- Ensure unique edit per slot per user
  UNIQUE(date_key, slot_key, user_id)
);

-- 2. Table for general priorities and encouragement
CREATE TABLE IF NOT EXISTS user_priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  -- Ensure unique value per key per user
  UNIQUE(key, user_id)
);

-- 3. Enable RLS
ALTER TABLE work_planner_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_priorities ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can manage their own planner edits" 
ON work_planner_edits FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own priorities" 
ON user_priorities FOR ALL 
USING (auth.uid() = user_id);

-- 5. Trigger for updated_at (optional but good practice)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_work_planner_edits_updated_at
    BEFORE UPDATE ON work_planner_edits
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_priorities_updated_at
    BEFORE UPDATE ON user_priorities
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
