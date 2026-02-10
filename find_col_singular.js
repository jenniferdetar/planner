const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function findColSingular() {
    const names = ['name', 'Name', '"Name"', '"name"', 'id', '"id"', 'jul', '"jul"'];
    for (const n of names) {
        const { error } = await supabase.from('paylog submission').select(n).limit(1);
        if (!error) console.log(`FOUND SINGULAR COLUMN: ${n}`);
        else console.log(`Column ${n} error: ${error.message}`);
    }
}

findColSingular();
