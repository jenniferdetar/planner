const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.rpc('get_policies', { table_name: 'paylog submission' });
    if (error) {
        // If RPC doesn't exist, try querying pg_policies
        const { data: policies, error: pError } = await supabase.from('pg_policies').select('*').eq('tablename', 'paylog submission');
        console.log('Policies:', policies || pError);
    } else {
        console.log(data);
    }
}
check();
