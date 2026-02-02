
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
    console.log('--- STARTING PAYLOG MIGRATION ---');
    
    // Fetch data from both tables
    console.log('Fetching data from "paylog submission" (UUID)...');
    const { data: uuidData, error: uuidError } = await supabase.from('paylog submission').select('*');
    if (uuidError) {
        console.error('Error fetching uuidData:', uuidError);
        return;
    }
    console.log(`Found ${uuidData.length} records in "paylog submission".`);

    console.log('Fetching data from "paylog submission" (Numeric)...');
    const { data: numData, error: numError } = await supabase.from('paylog submission').select('*');
    if (numError) {
        console.error('Error fetching numData:', numError);
        return;
    }
    console.log(`Found ${numData.length} records in "paylog submission".`);

    const months = ['jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'may', 'jun'];
    
    // Track max numeric ID to generate new ones
    let maxId = numData.reduce((max, curr) => {
        const idNum = parseInt(curr.id);
        return isNaN(idNum) ? max : Math.max(max, idNum);
    }, 1000000);

    let updatesCount = 0;
    let insertsCount = 0;

    for (const uuidRow of uuidData) {
        const existing = numData.find(n => n.name === uuidRow.name);
        
        if (existing) {
            // Check if there are any monthly values in uuidRow that are missing in existing
            const updateObj = {};
            let needsUpdate = false;
            
            months.forEach(m => {
                // If uuidRow has a value and existing doesn't (or is 'EMPTY')
                const uuidVal = uuidRow[m];
                const numVal = existing[m];
                
                if (uuidVal && uuidVal !== 'EMPTY' && (!numVal || numVal === 'EMPTY')) {
                    updateObj[m] = uuidVal;
                    needsUpdate = true;
                }
            });
            
            if (needsUpdate) {
                console.log(`Updating "${existing.name}" (ID: ${existing.id}) with missing months.`);
                const { error: updateErr } = await supabase
                    .from('paylog submission')
                    .update(updateObj)
                    .eq('id', existing.id);
                if (updateErr) {
                    console.error(`Error updating "${existing.name}":`, updateErr);
                } else {
                    updatesCount++;
                }
            }
        } else {
            // New record - generate numeric ID and insert
            maxId++;
            console.log(`Inserting new record: "${uuidRow.name}" (Assigned ID: ${maxId})`);
            
            const newRow = { ...uuidRow };
            newRow.id = maxId.toString();
            
            // Ensure we don't carry over any unwanted fields if schema differs slightly
            // (The numeric table expects specific columns)
            const cleanRow = {
                id: newRow.id,
                name: newRow.name
            };
            months.forEach(m => {
                cleanRow[m] = newRow[m] || 'EMPTY';
            });

            const { error: insertErr } = await supabase
                .from('paylog submission')
                .insert([cleanRow]);
                
            if (insertErr) {
                console.error(`Error inserting "${uuidRow.name}":`, insertErr);
            } else {
                insertsCount++;
            }
        }
    }
    
    console.log(`--- MIGRATION SUMMARY ---`);
    console.log(`Records Updated: ${updatesCount}`);
    console.log(`Records Inserted: ${insertsCount}`);
    console.log('--- MIGRATION COMPLETE ---');
}

runMigration();
