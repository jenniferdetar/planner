const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function clear() {
    const targets = [
        { table: 'paylog submission', col: 'name' },
        { table: 'hours_worked', col: 'name' },
        { table: 'approval_dates', col: 'Name' }
    ];
    for (const target of targets) {
        console.log(`Clearing ${target.table}...`);
        const { error } = await supabase.from(target.table).delete().neq(target.col, 'NON_EXISTENT_NAME_TO_CLEAR_ALL');
        if (error) {
            console.log(`Error clearing ${target.table}:`, error.message);
        } else {
            console.log(`Successfully cleared ${target.table}`);
        }
    }
    
    // Also clear category_entries for ICAAP data if any
    console.log('Clearing category_entries for ICAAP data...');
    const { error: e2 } = await supabase.from('category_entries').delete().ilike('category', '%icaap%');
    if (e2) console.log('Error clearing category_entries:', e2.message);
    else console.log('Successfully cleared category_entries for ICAAP');

    // Also clear work_planner_edits for attendance data
    console.log('Clearing work_planner_edits for attendance data...');
    const { error: e3 } = await supabase.from('work_planner_edits').delete().ilike('slot_key', 'attn-%');
    if (e3) console.log('Error clearing work_planner_edits:', e3.message);
    else console.log('Successfully cleared work_planner_edits for attendance');
}
clear();
