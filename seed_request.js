
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODUxNzcsImV4cCI6MjA4MTE2MTE3N30.bXob7mlt0m8QD5gQpcTYZlC3vrsPvUZt7u_tJB17XHE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
    console.log('Seeding data...');

    // Monthly Review (Financial Review)
    const financialEntries = [
        { date_key: 'fin-review-2026', slot_key: 'fin-goals', value: 'Complete the 2026 budget and increase savings by 15%.' },
        { date_key: 'fin-review-2026', slot_key: 'fin-expenses', value: 'Maintain monthly expenses under $4,500.' },
        { date_key: 'fin-review-2026', slot_key: 'fin-savings', value: 'Reached $10k in emergency fund.' }
    ];

    for (const entry of financialEntries) {
        // We use delete/insert to mimic the manual upsert in shared.js
        await supabase.from('work_planner_edits').delete().eq('date_key', entry.date_key).eq('slot_key', entry.slot_key);
        const { error } = await supabase.from('work_planner_edits').insert(entry);
        if (error) console.error('Error seeding financial:', error);
    }

    // Goals (Notes style)
    const goalsEntries = [
        { category: 'Goals-left', date_key: '2026-01-31', content: 'Professional development: Learn advanced Supabase RLS and multi-tenancy patterns.' },
        { category: 'Goals-right', date_key: '2026-01-31', content: 'Personal: Run 3 times a week and complete a half-marathon by June.' }
    ];

    for (const entry of goalsEntries) {
        const { error } = await supabase.from('category_entries').insert(entry);
        if (error) console.error('Error seeding goals:', error);
    }

    console.log('Seeding complete.');
}

seed();
