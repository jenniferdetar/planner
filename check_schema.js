const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log('Checking constraints on work_planner_edits...');
    const { data, error } = await supabase.rpc('get_table_constraints', { tname: 'work_planner_edits' });
    if (error) {
        // RPC might not exist, try another way
        console.log('RPC get_table_constraints failed, trying information_schema...');
        const { data: schemaData, error: schemaError } = await supabase
            .from('information_schema.table_constraints')
            .select('*')
            .eq('table_name', 'work_planner_edits');
        
        if (schemaError) {
            console.error('Schema check failed:', schemaError.message);
        } else {
            console.log('Constraints:', schemaData);
        }
    } else {
        console.log('Constraints:', data);
    }
}

checkSchema();
