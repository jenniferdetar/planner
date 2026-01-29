
-- Create financial_bills table
CREATE TABLE IF NOT EXISTS financial_bills (
    id SERIAL PRIMARY KEY,
    cat TEXT,
    item TEXT,
    amt TEXT,
    class TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE financial_bills ENABLE ROW LEVEL SECURITY;

-- Policies for public access (demo)
DROP POLICY IF EXISTS "Allow public read" ON financial_bills;
CREATE POLICY "Allow public read" ON financial_bills FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON financial_bills;
CREATE POLICY "Allow public insert" ON financial_bills FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON financial_bills;
CREATE POLICY "Allow public update" ON financial_bills FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete" ON financial_bills;
CREATE POLICY "Allow public delete" ON financial_bills FOR DELETE TO public USING (true);
