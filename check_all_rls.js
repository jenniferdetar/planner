const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const tables = [
    'work_planner_edits',
    'calendar_by_date',
    'category_entries',
    'category_notes',
    'member_interactions',
    'csea_members',
    'csea_stewards',
    'csea_issues',
    'school_directory'
];

async function check() {
    for (const table of tables) {
        console.log(`\nChecking table: ${table}`);
        const { data, error } = await supabase.from(table).insert({}).select();
        // We use insert({}) just to see if we get an error or if RLS blocks it.
        // Actually, a better way is to try a dummy insert with ANON key.
    }
}

async function testWithAnon() {
    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODUxNzcsImV4cCI6MjA4MTE2MTE3N30.bXob7mlt0m8QD5gQpcTYZlC3vrsPvUZt7u_tJB17XHE';
    const anonClient = createClient(SUPABASE_URL, ANON_KEY);

    for (const table of tables) {
        console.log(`\nTesting table with ANON key: ${table}`);
        
        // Try SELECT
        const { error: selectError } = await anonClient.from(table).select('*').limit(1);
        if (selectError) {
            console.log(`  SELECT failed: ${selectError.message}`);
        } else {
            console.log(`  SELECT SUCCESS`);
        }

        // Try INSERT (dummy)
        let dummyData = {};
        if (table === 'work_planner_edits') dummyData = { date_key: '1900-01-01', slot_key: 'test', value: 'test' };
        if (table === 'calendar_by_date') dummyData = { date: '1900-01-01', title: 'test' };
        if (table === 'category_entries') dummyData = { category: 'test', content: 'test' };
        if (table === 'category_notes') dummyData = { category: 'test', content: 'test' };
        if (table === 'member_interactions') dummyData = { category: 'test', date_spoke: '1900-01-01', member_name: 'test' };

        if (Object.keys(dummyData).length > 0) {
            const { error: insertError } = await anonClient.from(table).insert(dummyData);
            if (insertError) {
                console.log(`  INSERT failed: ${insertError.message}`);
            } else {
                console.log(`  INSERT SUCCESS`);
                // Cleanup
                const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
                await serviceClient.from(table).delete().match(dummyData);
            }
        }
    }
}

testWithAnon();
