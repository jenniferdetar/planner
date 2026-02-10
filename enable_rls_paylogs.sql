-- Enable RLS
ALTER TABLE "paylog submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hours_worked" ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on paylog submission" 
ON "paylog submission" FOR SELECT 
USING (true);

CREATE POLICY "Allow public update access on paylog submission" 
ON "paylog submission" FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public insert access on paylog submission" 
ON "paylog submission" FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read access on hours_worked" 
ON "hours_worked" FOR SELECT 
USING (true);

CREATE POLICY "Allow public update access on hours_worked" 
ON "hours_worked" FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public insert access on hours_worked" 
ON "hours_worked" FOR INSERT 
WITH CHECK (true);
