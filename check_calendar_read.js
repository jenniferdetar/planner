const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODUxNzcsImV4cCI6MjA4MTE2MTE3N30.bXob7mlt0m8QD5gQpcTYZlC3vrsPvUZt7u_tJB17XHE';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
    console.log('Testing read from "calendar_by_date" with anon key...');
    const { data, error } = await supabase.from('calendar_by_date').select('*').limit(1);
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Data fetched successfully:', data.length, 'rows');
    }
}
test();
