const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODUxNzcsImV4cCI6MjA4MTE2MTE3N30.bXob7mlt0m8QD5gQpcTYZlC3vrsPvUZt7u_tJB17XHE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debug() {
    console.log('--- Fetching paylog_submission ---');
    const { data: paylog, error: e1 } = await supabase.from('paylog_submission').select('*').limit(5);
    console.log('Data:', paylog);
    if (e1) console.error('Error:', e1.message);

    console.log('\n--- Fetching hours_worked ---');
    const { data: hours, error: e2 } = await supabase.from('hours_worked').select('*').limit(5);
    console.log('Data:', hours);
    if (e2) console.error('Error:', e2.message);

    console.log('\n--- Fetching approval_dates ---');
    const { data: approval, error: e3 } = await supabase.from('approval_dates').select('*').limit(5);
    console.log('Data:', approval);
    if (e3) console.error('Error:', e3.message);
}

debug();
