
-- Table for Paylog Submissions
CREATE TABLE IF NOT EXISTS "Paylog_Submission" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Ensure approval_dates has all months
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_dates' AND column_name='Jan') THEN
        ALTER TABLE "approval_dates" ADD COLUMN "Jan" TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_dates' AND column_name='Feb') THEN
        ALTER TABLE "approval_dates" ADD COLUMN "Feb" TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_dates' AND column_name='Mar') THEN
        ALTER TABLE "approval_dates" ADD COLUMN "Mar" TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_dates' AND column_name='Apr') THEN
        ALTER TABLE "approval_dates" ADD COLUMN "Apr" TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_dates' AND column_name='May') THEN
        ALTER TABLE "approval_dates" ADD COLUMN "May" TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_dates' AND column_name='Jun') THEN
        ALTER TABLE "approval_dates" ADD COLUMN "Jun" TEXT DEFAULT '';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE "Paylog_Submission" ENABLE ROW LEVEL SECURITY;

-- Public Policies
CREATE POLICY "Allow public read Paylog_Submission" ON "Paylog_Submission" FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert Paylog_Submission" ON "Paylog_Submission" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update Paylog_Submission" ON "Paylog_Submission" FOR UPDATE TO public USING (true) WITH CHECK (true);
