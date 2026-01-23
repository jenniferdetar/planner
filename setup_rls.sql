
-- Enable RLS
ALTER TABLE calendar_by_date ENABLE ROW LEVEL SECURITY;

-- Allow public read access (SELECT) for everyone (anon and authenticated)
CREATE POLICY "Allow public read access" 
ON calendar_by_date 
FOR SELECT 
TO public 
USING (true);
