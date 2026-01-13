-- Migration for all missing planner tables

-- Notes
CREATE TABLE IF NOT EXISTS planner_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings
CREATE TABLE IF NOT EXISTS planner_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  attendees TEXT[],
  agenda TEXT,
  notes TEXT,
  linked_task_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master Tasks
CREATE TABLE IF NOT EXISTS planner_master_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT,
  linked_goal_ids TEXT[],
  category TEXT,
  scheduled_task_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits
CREATE TABLE IF NOT EXISTS planner_habits (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit Status
CREATE TABLE IF NOT EXISTS planner_habit_status (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  habit_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, date, habit_id)
);

-- Work Planner Edits
CREATE TABLE IF NOT EXISTS work_planner_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date_key TEXT NOT NULL,
  slot_key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date_key, slot_key)
);

-- User Priorities
CREATE TABLE IF NOT EXISTS user_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Generic Metadata for remaining keys
CREATE TABLE IF NOT EXISTS planner_metadata (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);

-- Enable RLS
ALTER TABLE planner_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_master_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_habit_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_planner_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage their own planner_notes" ON planner_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own planner_meetings" ON planner_meetings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own planner_master_tasks" ON planner_master_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own planner_habits" ON planner_habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own planner_habit_status" ON planner_habit_status FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own work_planner_edits" ON work_planner_edits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own user_priorities" ON user_priorities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own planner_metadata" ON planner_metadata FOR ALL USING (auth.uid() = user_id);
