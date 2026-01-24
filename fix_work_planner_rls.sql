-- Enable RLS on work_planner_edits
ALTER TABLE work_planner_edits ENABLE ROW LEVEL SECURITY;

-- Allow public access for anon users
CREATE POLICY "Allow public read" ON work_planner_edits FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert" ON work_planner_edits FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update" ON work_planner_edits FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON work_planner_edits FOR DELETE TO public USING (true);
