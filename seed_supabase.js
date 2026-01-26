
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const events = [];

// 1. Process the manual list from full_event_list.txt
const rawData = fs.readFileSync('/Users/jenniferdetar/git/full_event_list.txt', 'utf8');
const lines = rawData.split('\n');

lines.forEach(line => {
    if (!line.trim()) return;
    const parts = line.split('\t');
    if (parts.length < 2) return;
    
    const title = parts[0].trim();
    const dateParts = parts[1].trim().split('/');
    if (dateParts.length !== 3) return;
    
    // Format to YYYY-MM-DD
    const month = dateParts[0].padStart(2, '0');
    const day = dateParts[1].padStart(2, '0');
    const year = '20' + dateParts[2]; // assuming 26/27 are 2026/2027
    const dateStr = `${year}-${month}-${day}`;
    
    const event = { date: dateStr, title };

    // Add time if present
    if (parts.length >= 3 && parts[2].trim()) {
        const timeStr = parts[2].trim();
        const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2];
            const ampm = timeMatch[3].toUpperCase();
            
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            
            event.time = `${hours.toString().padStart(2, '0')}:${minutes}:00`;
        }
    }
    
    events.push(event);
});

// 2. Add "Jennifer's Paycheck" (8th/23rd logic) for 2026
for (let month = 0; month < 12; month++) {
    const year = 2026;
    [8, 23].forEach(day => {
        let paydayDate = new Date(year, month, day);
        if (paydayDate.getDay() === 6) paydayDate.setDate(day - 1);
        else if (paydayDate.getDay() === 0) paydayDate.setDate(day - 2);
        
        const pdStr = paydayDate.toISOString().split('T')[0];
        events.push({ date: pdStr, title: "Payday" });

        // Budget 3 days before payday
        const budgetDate = new Date(paydayDate);
        budgetDate.setDate(budgetDate.getDate() - 3);
        events.push({ date: budgetDate.toISOString().split('T')[0], title: "Budget" });
    });
}

async function seedData() {
    console.log('Clearing existing data...');
    const { error: delError } = await supabase.from('calendar_by_date').delete().neq('date', '1900-01-01');
    if (delError) console.error('Delete error:', delError);

    console.log(`Inserting ${events.length} events (Manual list + Paychecks)...`);
    
    // Chunking to avoid large request errors
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
