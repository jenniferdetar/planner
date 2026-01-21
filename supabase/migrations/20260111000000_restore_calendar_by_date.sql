-- Restore missing calendar_by_date table
CREATE TABLE IF NOT EXISTS calendar_by_date (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE calendar_by_date ENABLE ROW LEVEL SECURITY;

-- Create Policy
DROP POLICY IF EXISTS "Users manage their own calendar_by_date" ON calendar_by_date;
CREATE POLICY "Users manage their own calendar_by_date" ON calendar_by_date 
FOR ALL USING (auth.uid() = user_id);
