
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const events = [];

// 1. Process the new list
const filePath = '/Users/jenniferdetar/git/full_event_list.txt';
const rawData = fs.readFileSync(filePath, 'utf8');
const lines = rawData.split('\n');

lines.forEach((line, index) => {
    if (index === 0) return; // Skip header
    if (!line.trim()) return;
    const parts = line.split('\t');
    if (parts.length < 2) return;
    
    const title = parts[0].trim();
    const dateStrRaw = parts[1].trim();
    let time = parts[2] ? parts[2].trim() : null;
    if (time === "") time = null;
    
    const dateParts = dateStrRaw.split('/');
    if (dateParts.length !== 3) return;
    
    // Format to YYYY-MM-DD
    const month = dateParts[0].padStart(2, '0');
    const day = dateParts[1].padStart(2, '0');
    let year = dateParts[2];
    if (year.length === 2) year = '20' + year;
    const dateStr = `${year}-${month}-${day}`;
    
    events.push({ date: dateStr, title, time });
});

// 2. Add "Jennifer's Paycheck" (8th/23rd logic) for 2026 & 2027
[2026, 2027].forEach(year => {
    for (let month = 0; month < 12; month++) {
        [8, 23].forEach(day => {
            let paydayDate = new Date(year, month, day);
            if (paydayDate.getDay() === 6) paydayDate.setDate(day - 1);
            else if (paydayDate.getDay() === 0) paydayDate.setDate(day - 2);
            
            const pdStr = paydayDate.toISOString().split('T')[0];
            events.push({ date: pdStr, title: "Jennifer's Paycheck", time: null });

            // Budget 3 days before payday
            const budgetDate = new Date(paydayDate);
            budgetDate.setDate(budgetDate.getDate() - 3);
            events.push({ date: budgetDate.toISOString().split('T')[0], title: "BUDGET", time: null });
        });
    }
});

async function seedData() {
    console.log('Clearing existing data...');
    const { error: delError } = await supabase.from('calendar_by_date').delete().neq('date', '1900-01-01');
    if (delError) console.error('Delete error:', delError);

    console.log(`Inserting ${events.length} events...`);
    
    const CHUNK_SIZE = 100;
    for (let i = 0; i < events.length; i += CHUNK_SIZE) {
        const chunk = events.slice(i, i + CHUNK_SIZE);
        const { error } = await supabase.from('calendar_by_date').insert(chunk);
        if (error) {
            console.error(`Error seeding chunk ${i}:`, error);
        } else {
            console.log(`Successfully seeded chunk starting at index ${i}`);
        }
    }
    console.log('Seeding complete.');
}

seedData();
