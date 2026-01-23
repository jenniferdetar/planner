
-- Table to store category-specific notes
CREATE TABLE IF NOT EXISTS category_notes (
    id SERIAL PRIMARY KEY,
    category TEXT UNIQUE NOT NULL,
    content TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE category_notes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON category_notes FOR SELECT TO public USING (true);

-- Allow public insert/update (for demo purposes, ideally restricted)
CREATE POLICY "Allow public insert" ON category_notes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update" ON category_notes FOR UPDATE TO public USING (true) WITH CHECK (true);
