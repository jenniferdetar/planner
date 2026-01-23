
-- Table to store planner-specific editable content
CREATE TABLE IF NOT EXISTS planner_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL, -- The date this data belongs to (e.g. start of week or specific day)
    field_id TEXT NOT NULL, -- The identifier for the field (e.g. 'priority-1', 'slot-06:00')
    content TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, field_id)
);

-- Enable RLS
ALTER TABLE planner_data ENABLE ROW LEVEL SECURITY;

-- Allow public access for demo purposes
CREATE POLICY "Allow public read access" ON planner_data FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert" ON planner_data FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update" ON planner_data FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON planner_data FOR DELETE TO public USING (true);
