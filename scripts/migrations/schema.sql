-- Create Tables for Offloaded Data

-- Calendar Recurring Events
CREATE TABLE calendar_recurring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  time TIME,
  end_time TIME,
  pattern TEXT,
  day_of_month INTEGER,
  weekdays INTEGER[],
  skip_months TEXT[],
  skip_holidays BOOLEAN DEFAULT FALSE,
  skip_dates DATE[],
  holiday_rule TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Calendar Fixed Events
CREATE TABLE calendar_by_date (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Goals (SMART Goals)
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT UNIQUE NOT NULL,
  category TEXT,
  specific TEXT,
  measurable TEXT,
  achievable TEXT,
  relevant TEXT,
  timebound TEXT,
  statement TEXT,
  weekly_tasks TEXT[],
  ties_to TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Hours Worked (CSEA/ICAAP)
CREATE TABLE hours_worked (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  jul NUMERIC,
  aug NUMERIC,
  sep NUMERIC,
  oct NUMERIC,
  nov NUMERIC,
  dec NUMERIC,
  jan NUMERIC,
  feb NUMERIC,
  mar NUMERIC,
  apr NUMERIC,
  may NUMERIC,
  jun NUMERIC,
  total NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Vision Board Photos (Metadata)
CREATE TABLE vision_board_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  category TEXT,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- RLS Policies
ALTER TABLE calendar_recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_by_date ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hours_worked ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_board_photos ENABLE ROW LEVEL SECURITY;

-- Simple RLS (User can see/edit their own data)
CREATE POLICY "Users can manage their own recurring events" ON calendar_recurring FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own fixed events" ON calendar_by_date FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own hours" ON hours_worked FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own vision photos" ON vision_board_photos FOR ALL USING (auth.uid() = user_id);
