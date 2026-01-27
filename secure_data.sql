-- Secure all tables to require authentication

-- Function to enable RLS and set authenticated policies
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'work_planner_edits',
        'calendar_by_date',
        'category_entries',
        'category_notes',
        'member_interactions',
        'csea_members',
        'hours_worked',
        'approval_dates',
        'paylog_submission'
    ];
BEGIN
    FOR t IN SELECT unnest(tables) LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        
        -- Drop existing public policies if they exist (you might need to adjust names if they differ)
        -- This is a generic approach, you might want to manually drop specifically named policies
        
        -- Create restrictive policies for authenticated users
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated select" ON %I;', t);
        EXECUTE format('CREATE POLICY "Allow authenticated select" ON %I FOR SELECT TO authenticated USING (true);', t);
        
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated insert" ON %I;', t);
        EXECUTE format('CREATE POLICY "Allow authenticated insert" ON %I FOR INSERT TO authenticated WITH CHECK (true);', t);
        
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated update" ON %I;', t);
        EXECUTE format('CREATE POLICY "Allow authenticated update" ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true);', t);
        
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated delete" ON %I;', t);
        EXECUTE format('CREATE POLICY "Allow authenticated delete" ON %I FOR DELETE TO authenticated USING (true);', t);

        -- Remove public access
        EXECUTE format('DROP POLICY IF EXISTS "Allow public read access" ON %I;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow public read" ON %I;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow public insert" ON %I;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow public update" ON %I;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow public delete" ON %I;', t);
    END LOOP;
END $$;
