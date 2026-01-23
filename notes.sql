
-- Table to store category-specific notes
CREATE TABLE IF NOT EXISTS category_notes (
    id SERIAL PRIMARY KEY,
    category TEXT UNIQUE NOT NULL,
    content TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to store multiple timestamped entries for categories
CREATE TABLE IF NOT EXISTS category_entries (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE category_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_entries ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON category_notes FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access category_entries" ON category_entries FOR SELECT TO public USING (true);

-- Allow public insert/update
CREATE POLICY "Allow public insert" ON category_notes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update" ON category_notes FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public insert category_entries" ON category_entries FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update category_entries" ON category_entries FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete category_entries" ON category_entries FOR DELETE TO public USING (true);

-- Table to store member interaction logs
CREATE TABLE IF NOT EXISTS member_interactions (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    date_spoke DATE NOT NULL,
    member_name TEXT NOT NULL,
    work_location TEXT,
    discussion TEXT,
    who_involved TEXT,
    contact_person TEXT,
    point_of_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE member_interactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read interactions" ON member_interactions FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert interactions" ON member_interactions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public delete interactions" ON member_interactions FOR DELETE TO public USING (true);

-- CSEA Members Reference
CREATE TABLE IF NOT EXISTS csea_members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    work_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CSEA Stewards Reference
CREATE TABLE IF NOT EXISTS csea_stewards (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CSEA Issues Reference
CREATE TABLE IF NOT EXISTS csea_issues (
    id SERIAL PRIMARY KEY,
    issue_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- School Directory Reference
CREATE TABLE IF NOT EXISTS school_directory (
    id SERIAL PRIMARY KEY,
    site_name TEXT UNIQUE NOT NULL,
    region TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for new tables
ALTER TABLE csea_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE csea_stewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE csea_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_directory ENABLE ROW LEVEL SECURITY;

-- Public read access for references
CREATE POLICY "Allow public read members" ON csea_members FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read stewards" ON csea_stewards FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read issues" ON csea_issues FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read schools" ON school_directory FOR SELECT TO public USING (true);

-- Allow public insert for setup/management
CREATE POLICY "Allow public insert members" ON csea_members FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert stewards" ON csea_stewards FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert issues" ON csea_issues FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert schools" ON school_directory FOR INSERT TO public WITH CHECK (true);
