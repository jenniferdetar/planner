-- Cloud-backed tables for planner and HOA

CREATE TABLE IF NOT EXISTS planner_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  due_time TEXT,
  priority TEXT,
  completed BOOLEAN DEFAULT FALSE,
  linked_goal_ids TEXT[],
  category TEXT,
  subtasks JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  category TEXT,
  mission_alignment TEXT[],
  timeframe TEXT,
  linked_task_ids TEXT[],
  progress_percent NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hoa_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  unit_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hoa_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_name TEXT,
  file_name TEXT,
  file_url TEXT,
  summary TEXT,
  pages INTEGER,
  words INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hoa_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hoa_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own planner_tasks"
  ON planner_tasks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage their own planner_goals"
  ON planner_goals FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage their own hoa_notes"
  ON hoa_notes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage their own hoa_units"
  ON hoa_units FOR ALL
  USING (auth.uid() = user_id);
