-- Create opus_metadata table
CREATE TABLE IF NOT EXISTS opus_metadata (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);

-- Enable RLS
ALTER TABLE opus_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users manage their own opus_metadata" ON opus_metadata;
CREATE POLICY "Users manage their own opus_metadata" ON opus_metadata FOR ALL USING (auth.uid() = user_id);
