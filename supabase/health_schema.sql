-- Health & Wellness schema migration
-- Run after finance_docs.sql

-- User-defined habits (definitions, not completions)
CREATE TABLE IF NOT EXISTS public.habits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,          -- 'Movement', 'Sleep', 'Nutrition', 'Mental', 'Medical'
  frequency   TEXT DEFAULT 'daily',   -- 'daily' | 'weekly'
  target_days INT DEFAULT 7,          -- per week
  active      BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "habits owner" ON public.habits;
CREATE POLICY "habits owner" ON public.habits
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Daily health log (mood, energy, sleep, notes)
CREATE TABLE IF NOT EXISTS public.health_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  mood       SMALLINT CHECK (mood BETWEEN 1 AND 5),
  energy     SMALLINT CHECK (energy BETWEEN 1 AND 5),
  sleep_hrs  NUMERIC(4,1),
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.health_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "health_log owner" ON public.health_log;
CREATE POLICY "health_log owner" ON public.health_log
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Health goals (doctor visits, fitness milestones, etc.)
CREATE TABLE IF NOT EXISTS public.health_goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  category    TEXT,                   -- 'Medical', 'Fitness', 'Nutrition', 'Mental Health'
  target_date DATE,
  completed   BOOLEAN DEFAULT FALSE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "health_goals owner" ON public.health_goals;
CREATE POLICY "health_goals owner" ON public.health_goals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
