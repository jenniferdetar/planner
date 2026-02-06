
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const employees = [
    "Bonnie Ratner", "Eberardo Rodriguez", "Maikai Finnell", "Patricia Pernin",
    "Rene Gaudet", "Stephen Maccarone", "Zina Dixon"
];

const financialBills = [
    { id: 1, cat: 'Auto', item: 'Auto Maintenance', amt: '$100', class: 'row-auto' },
    { id: 2, cat: 'Auto', item: 'Mercury Auto Insurance', amt: '$388', class: 'row-auto' },
    { id: 3, cat: 'Auto', item: 'Tahoe Registration', amt: '$15', class: 'row-auto' },
    { id: 4, cat: 'Auto', item: 'Trailblazer Registration', amt: '$28', class: 'row-auto' },
    { id: 5, cat: 'Bill Pay', item: 'DWP', amt: '$100', class: 'row-bill' },
    { id: 6, cat: 'Bill Pay', item: 'Jeff\'s Credit Cards', amt: '$500', class: 'row-bill' },
    { id: 7, cat: 'Bill Pay', item: 'Jennifer\'s Student Loans', amt: '$150', class: 'row-bill' },
    { id: 8, cat: 'Bill Pay', item: 'Schools First Loan', amt: '$142', class: 'row-bill' },
    { id: 9, cat: 'Cash', item: 'Cleaning Lady', amt: '$320', class: 'row-cash' },
    { id: 10, cat: 'Cash', item: 'Gas', amt: '$600', class: 'row-cash' },
    { id: 11, cat: 'Cash', item: 'Laundry', amt: '$80', class: 'row-cash' },
    { id: 12, cat: 'Credit Card', item: 'ADT', amt: '$53', class: 'row-cc' },
    { id: 13, cat: 'Credit Card', item: 'Amazon', amt: '$100', class: 'row-cc' },
    { id: 14, cat: 'Credit Card', item: 'Groceries', amt: '$600', class: 'row-cc' },
    { id: 15, cat: 'Credit Card', item: 'Hair', amt: '$110', class: 'row-cc' },
    { id: 16, cat: 'Credit Card', item: 'Orkin', amt: '$50', class: 'row-cc' },
    { id: 17, cat: 'Housing', item: 'HELOC', amt: '$357', class: 'row-housing' },
    { id: 18, cat: 'Housing', item: 'Hoa', amt: '$520', class: 'row-housing' },
    { id: 19, cat: 'Housing', item: 'Mortgage', amt: '$2,250', class: 'row-housing' },
    { id: 20, cat: 'Housing', item: 'Spectrum', amt: '$197', class: 'row-housing' },
    { id: 21, cat: 'Housing', item: 'Verizon', amt: '$283', class: 'row-housing' },
    { id: 22, cat: 'Savings', item: 'Blow', amt: '$200', class: 'row-savings' },
    { id: 23, cat: 'Savings', item: 'HSA', amt: '$200', class: 'row-savings' },
    { id: 24, cat: 'Savings', item: 'Summer Saver', amt: '$400', class: 'row-savings' },
    { id: 25, cat: 'Savings', item: 'Tahoe\'s Major Repairs', amt: '$200', class: 'row-savings' },
    { id: 26, cat: 'Savings', item: 'Vacation', amt: '$125', class: 'row-savings' }
];

async function seed() {
    console.log('Clearing existing data...');
    await supabase.from('csea_members').delete().neq('full_name', 'clear-all');
    await supabase.from('financial_bills').delete().neq('item', 'clear-all');

    console.log('Seeding employees...');
    const employeeData = employees.map(name => ({ full_name: name }));
    const { error: empError } = await supabase.from('csea_members').insert(employeeData);
    if (empError) console.error('Error seeding employees:', empError);
    else console.log('Successfully seeded employees');

    console.log('Seeding financial bills...');
    // Create table first if needed (via RPC or assuming it exists)
    // For now just try to insert
    const { error: billError } = await supabase.from('financial_bills').insert(financialBills);
    if (billError) {
        if (billError.code === 'PGRST204' || billError.message.includes('not found')) {
            console.log('Table financial_bills not found. You might need to create it manually in Supabase SQL editor:');
            console.log(`
            CREATE TABLE financial_bills (
                id SERIAL PRIMARY KEY,
                cat TEXT,
                item TEXT,
                amt TEXT,
                class TEXT
            );
            ALTER TABLE financial_bills ENABLE ROW LEVEL SECURITY;
            CREATE POLICY "Allow public read" ON financial_bills FOR SELECT TO public USING (true);
            `);
        } else {
            console.error('Error seeding financial bills:', billError);
        }
    } else {
        console.log('Successfully seeded financial bills');
    }
}

seed();
