-- Comprehensive RLS Fix for ICAAP Tables
-- This enables RLS and allows ALL public (anon) operations (SELECT, INSERT, UPDATE, DELETE)

-- 1. paylog submission
ALTER TABLE "paylog submission" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access on paylog submission" ON "paylog submission";
CREATE POLICY "Public Full Access on paylog submission" ON "paylog submission" 
FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. hours worked
ALTER TABLE "hours worked" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access on hours worked" ON "hours worked";
CREATE POLICY "Public Full Access on hours worked" ON "hours worked" 
FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. approval_dates
ALTER TABLE "approval_dates" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access on approval_dates" ON "approval_dates";
CREATE POLICY "Public Full Access on approval_dates" ON "approval_dates" 
FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. attendance tracker
ALTER TABLE "attendance tracker" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access on attendance tracker" ON "attendance tracker";
CREATE POLICY "Public Full Access on attendance tracker" ON "attendance tracker" 
FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. work_planner_edits (Used for persistent keys like 'icaap-attendance-data-2025')
ALTER TABLE "work_planner_edits" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access on work_planner_edits" ON "work_planner_edits";
CREATE POLICY "Public Full Access on work_planner_edits" ON "work_planner_edits" 
FOR ALL TO public USING (true) WITH CHECK (true);

-- 6. employees (Already enabled SELECT, but let's ensure full access if needed for sync/add)
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access on employees" ON "employees";
CREATE POLICY "Public Full Access on employees" ON "employees" 
FOR ALL TO public USING (true) WITH CHECK (true);
