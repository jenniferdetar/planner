const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODUxNzcsImV4cCI6MjA4MTE2MTE3N30.bXob7mlt0m8QD5gQpcTYZlC3vrsPvUZt7u_tJB17XHE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function probe() {
    console.log('Testing INSERT with ANON key on work_planner_edits...');
    const { data, error } = await supabase.from('work_planner_edits').insert({
        date_key: '2026-01-01',
        slot_key: 'anon-test',
        value: 'test-value'
    });
    
    if (error) {
        console.error('INSERT failed:', error.message, error.code, error.details);
    } else {
        console.log('INSERT SUCCESS!');
    }
}

probe();
