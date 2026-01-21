-- Migration to unify schema to opus_ prefix and merge duplicate data
-- Date: 2026-01-14

-- 1. Tasks: Merge planner_tasks into opus_tasks if both exist
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planner_tasks') AND 
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'opus_tasks') THEN
        INSERT INTO opus_tasks (id, user_id, title, description, due_date, due_time, priority, completed, linked_goal_ids, category, subtasks, created_at, updated_at)
        SELECT id, user_id, title, description, due_date, due_time, priority, completed, linked_goal_ids, category, subtasks, created_at, updated_at
        FROM planner_tasks
        ON CONFLICT (id) DO NOTHING;
        DROP TABLE planner_tasks;
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planner_tasks') THEN
        ALTER TABLE planner_tasks RENAME TO opus_tasks;
    END IF;
END $$;

-- 2. Goals: Unify goals and planner_goals into opus_goals
DO $$ 
BEGIN 
    -- Ensure opus_goals exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'opus_goals') THEN
        CREATE TABLE opus_goals (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'Active',
            category TEXT DEFAULT 'General',
            mission_alignment TEXT[],
            timeframe TEXT,
            linked_task_ids TEXT[],
            progress_percent NUMERIC DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Merge planner_goals
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planner_goals') THEN
        INSERT INTO opus_goals (id, user_id, title, description, status, category, mission_alignment, timeframe, linked_task_ids, progress_percent, created_at, updated_at)
        SELECT id, user_id, title, description, status, category, mission_alignment, timeframe, linked_task_ids, progress_percent, created_at, updated_at
        FROM planner_goals
        ON CONFLICT (id) DO NOTHING;
        DROP TABLE planner_goals;
    END IF;

    -- Merge legacy 'goals' table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'goals') THEN
        INSERT INTO opus_goals (id, user_id, title, category, status, created_at)
        SELECT id, user_id, title, category, 'Active', created_at
        FROM goals
        ON CONFLICT (id) DO NOTHING;
        DROP TABLE goals;
    END IF;
END $$;

-- 3. Notes: Merge planner_notes and hoa_notes into opus_notes
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'opus_notes') THEN
        CREATE TABLE opus_notes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            content TEXT,
            tags TEXT[],
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planner_notes') THEN
        INSERT INTO opus_notes (id, user_id, date, content, tags, created_at, updated_at)
        SELECT id, user_id, date, content, tags, created_at, updated_at
        FROM planner_notes
        ON CONFLICT (id) DO NOTHING;
        DROP TABLE planner_notes;
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hoa_notes') THEN
        INSERT INTO opus_notes (user_id, date, content, tags, created_at)
        SELECT user_id, created_at::date, content, ARRAY['HOA'], created_at
        FROM hoa_notes;
        DROP TABLE hoa_notes;
    END IF;
END $$;

-- 4. Meetings: Merge planner_meetings into opus_meetings
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'opus_meetings') THEN
        CREATE TABLE opus_meetings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            date DATE NOT NULL,
            start_time TEXT,
            end_time TEXT,
            location TEXT,
            attendees TEXT[],
            agenda TEXT,
            notes TEXT,
            linked_task_ids TEXT[],
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planner_meetings') THEN
        INSERT INTO opus_meetings (id, user_id, title, date, start_time, end_time, location, attendees, agenda, notes, linked_task_ids, created_at, updated_at)
        SELECT id, user_id, title, date, start_time, end_time, location, attendees, agenda, notes, linked_task_ids, created_at, updated_at
        FROM planner_meetings
        ON CONFLICT (id) DO NOTHING;
        DROP TABLE planner_meetings;
    END IF;
END $$;

-- 5. Habits: Unify to opus_habits
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planner_habits') THEN
        ALTER TABLE planner_habits RENAME TO opus_habits;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planner_habit_status') THEN
        ALTER TABLE planner_habit_status RENAME TO opus_habit_status;
    END IF;
END $$;

-- 6. Metadata: Unify to opus_metadata
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planner_metadata') THEN
        ALTER TABLE planner_metadata RENAME TO opus_metadata;
    END IF;
END $$;

-- 7. Master Tasks: Unify to opus_master_tasks
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'planner_master_tasks') THEN
        ALTER TABLE planner_master_tasks RENAME TO opus_master_tasks;
    END IF;
END $$;

-- Enable RLS and re-apply policies
DO $$ 
DECLARE
    t text;
BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'opus_%' 
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users manage their own %I" ON %I', t, t);
        EXECUTE format('CREATE POLICY "Users manage their own %I" ON %I FOR ALL USING (auth.uid() = user_id)', t, t);
    END LOOP;
END $$;
