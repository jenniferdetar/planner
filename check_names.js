const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const tables = ['paylog submission', 'hours_worked', 'approval_dates'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            console.log(`Error fetching from ${table}:`, error.message);
        } else {
            console.log(`Records in ${table}: ${data.length}`);
            if (data.length > 0) {
                const names = data.map(r => r.name || r.Name || 'unknown');
                console.log(`Names in ${table}: ${[...new Set(names)].slice(0, 10).join(', ')}...`);
            }
        }
    }
}
check();
