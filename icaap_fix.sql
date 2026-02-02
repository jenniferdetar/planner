
-- 1. Create Paylog_Submission table (lowercase to match shared.js)
CREATE TABLE IF NOT EXISTS "paylog submission" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    jul TEXT DEFAULT '',
    aug TEXT DEFAULT '',
    sep TEXT DEFAULT '',
    oct TEXT DEFAULT '',
    nov TEXT DEFAULT '',
    dec TEXT DEFAULT '',
    jan TEXT DEFAULT '',
    feb TEXT DEFAULT '',
    mar TEXT DEFAULT '',
    apr TEXT DEFAULT '',
    may TEXT DEFAULT '',
    jun TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enable RLS on all iCAAP tables
ALTER TABLE "paylog submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hours_worked" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "approval_dates" ENABLE ROW LEVEL SECURITY;

-- 3. Create public policies for paylog submission
DROP POLICY IF EXISTS "Allow public read paylog submission" ON "paylog submission";
CREATE POLICY "Allow public read paylog submission" ON "paylog submission" FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow public insert paylog submission" ON "paylog submission";
CREATE POLICY "Allow public insert paylog submission" ON "paylog submission" FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update paylog submission" ON "paylog submission";
CREATE POLICY "Allow public update paylog submission" ON "paylog submission" FOR UPDATE TO public USING (true) WITH CHECK (true);

-- 4. Create public policies for hours_worked
DROP POLICY IF EXISTS "Allow public read hours_worked" ON "hours_worked";
CREATE POLICY "Allow public read hours_worked" ON "hours_worked" FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow public insert hours_worked" ON "hours_worked";
CREATE POLICY "Allow public insert hours_worked" ON "hours_worked" FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update hours_worked" ON "hours_worked";
CREATE POLICY "Allow public update hours_worked" ON "hours_worked" FOR UPDATE TO public USING (true) WITH CHECK (true);

-- 5. Create public policies for approval_dates
DROP POLICY IF EXISTS "Allow public read approval_dates" ON "approval_dates";
CREATE POLICY "Allow public read approval_dates" ON "approval_dates" FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow public insert approval_dates" ON "approval_dates";
CREATE POLICY "Allow public insert approval_dates" ON "approval_dates" FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update approval_dates" ON "approval_dates";
CREATE POLICY "Allow public update approval_dates" ON "approval_dates" FOR UPDATE TO public USING (true) WITH CHECK (true);
