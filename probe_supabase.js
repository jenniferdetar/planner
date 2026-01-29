const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function probe() {
    console.log('Probing work_planner_edits...');
    const { data: data1, error: error1 } = await supabase.from('work_planner_edits').select('*').limit(1);
    if (error1) {
        console.error('work_planner_edits error:', error1.message);
    } else {
        console.log('work_planner_edits SUCCESS! Data:', data1);
    }

    console.log('\nProbing calendar_by_date...');
    const { data: data2, error: error2 } = await supabase.from('calendar_by_date').select('*').limit(5);
    if (error2) {
        console.error('calendar_by_date error:', error2.message);
    } else {
        console.log('calendar_by_date SUCCESS! Data:', data2);
    }

    console.log('\nProbing category_entries...');
    const { data: data3, error: error3 } = await supabase.from('category_entries').select('*').limit(1);
    if (error3) {
        console.error('category_entries error:', error3.message);
    } else {
        console.log('category_entries SUCCESS! Data:', data3);
    }
}

probe();
