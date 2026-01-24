
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkTables() {
    // Try to select from a non-existent table to see if we get a hint or if we can see schema
    const { data: tables, error } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
    
    if (error) {
        console.error('Error fetching tables:', error);
    } else {
        console.log('Tables in public schema:', tables);
    }

    // Try member_interactions specifically
    const { data: inter, error: interError } = await supabase.from('member_interactions').select('*').limit(1);
    console.log('member_interactions check:', interError ? interError.message : 'Success');

    // Try school_directory specifically
    const { data: school, error: schoolError } = await supabase.from('school_directory').select('*').limit(1);
    console.log('school_directory check:', schoolError ? schoolError.message : 'Success');
}

checkTables();
