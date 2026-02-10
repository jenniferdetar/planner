const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'hours_worked' });
    if (error) {
        // Fallback to querying a system view if RPC not available
        const { data: constraints, error: cError } = await supabase.from('pg_indexes').select('*').eq('tablename', 'hours_worked');
        console.log('Indexes for hours_worked:', constraints || cError);
        return;
    }
    console.log(data);
}
check();
