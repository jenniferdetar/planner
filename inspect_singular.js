const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function inspectData() {
    const { data, error } = await supabase.from('paylog submission').select('*').limit(1);
    if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        console.log('Table is empty or Error:', error);
    }
}

inspectData();
