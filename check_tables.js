const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.rpc('get_tables'); // long shot
    if (error) {
        // Try querying information_schema if allowed (usually not via PostgREST)
        const { data: d2, error: e2 } = await supabase.from('pg_tables').select('tablename').eq('schemaname', 'public');
        if (e2) {
            console.log('Error listing tables:', e2.message);
        } else {
            console.log('Tables:', d2);
        }
    } else {
        console.log('Tables:', data);
    }
}
check();
