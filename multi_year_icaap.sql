
-- Migration to support multi-year ICAAP tracking
-- We use the start year of the fiscal year (e.g., 2025 for July 2025 - June 2026)

-- 1. Add fiscal_year column
ALTER TABLE "hours_worked" ADD COLUMN IF NOT EXISTS fiscal_year INTEGER DEFAULT 2025;
ALTER TABLE "approval_dates" ADD COLUMN IF NOT EXISTS fiscal_year INTEGER DEFAULT 2025;
ALTER TABLE "paylog_submission" ADD COLUMN IF NOT EXISTS fiscal_year INTEGER DEFAULT 2025;

-- 2. Update constraints to allow the same name in different years
-- We try to drop existing name-only unique constraints if they exist
DO $$ 
BEGIN 
    -- paylog_submission
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='paylog_submission_name_key') THEN
        ALTER TABLE "paylog_submission" DROP CONSTRAINT paylog_submission_name_key;
    END IF;
    
    -- hours_worked
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='hours_worked_name_key') THEN
        ALTER TABLE "hours_worked" DROP CONSTRAINT hours_worked_name_key;
    END IF;

    -- approval_dates
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='approval_dates_Name_key') THEN
        ALTER TABLE "approval_dates" DROP CONSTRAINT "approval_dates_Name_key";
    END IF;
END $$;

-- 3. Add new composite unique constraints
ALTER TABLE "paylog_submission" ADD CONSTRAINT paylog_submission_name_year_key UNIQUE (name, fiscal_year);
ALTER TABLE "hours_worked" ADD CONSTRAINT hours_worked_name_year_key UNIQUE (name, fiscal_year);
ALTER TABLE "approval_dates" ADD CONSTRAINT approval_dates_name_year_key UNIQUE ("Name", fiscal_year);
