-- Enable RLS and Public Access for ICAAP Notes Tables
-- This allows the frontend to fetch data from these specific tables

-- 1. profesional development 09-27-25
ALTER TABLE "profesional development 09-27-25" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Access on prof_dev" ON "profesional development 09-27-25";
CREATE POLICY "Public Select Access on prof_dev" ON "profesional development 09-27-25" 
FOR SELECT TO public USING (true);

-- 2. winter break 2025-2026
ALTER TABLE "winter break 2025-2026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Access on winter_break" ON "winter break 2025-2026";
CREATE POLICY "Public Select Access on winter_break" ON "winter break 2025-2026" 
FOR SELECT TO public USING (true);

-- 3. january 2026
ALTER TABLE "january 2026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Access on january_2026" ON "january 2026";
CREATE POLICY "Public Select Access on january_2026" ON "january 2026" 
FOR SELECT TO public USING (true);
