const { createClient } = require('@supabase/supabase-js');
const { MongoClient } = require('mongodb');

// Supabase Configuration (Extracted from shared.js)
const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODUxNzcsImV4cCI6MjA4MTE2MTE3N30.bXob7mlt0m8QD5gQpcTYZlC3vrsPvUZt7u_tJB17XHE';

// MongoDB Configuration (User should provide their own URI and database name)
const MONGODB_URI = 'mongodb+srv://jennifermsamples_db_user:0ct052013@cluster0.tnqqlzj.mongodb.net/?appName=Cluster0';
const MONGODB_DB_NAME = 'planner_2026';

const tablesToMigrate = [
    'approval_dates',
    'attendance tracker',
    'calendar_by_date',
    'category_entries',
    'csea_members',
    'csea_stewards',
    'employees',
    'financial_bills',
    'hoa_expenses',
    'hours_worked',
    'member_interactions',
    'opus_metadata',
    'paylog submission',
    'paylog submissions',
    'planner_data',
    'school_directory',
    'work_planner_edits'
];

async function migrate() {
    console.log('Starting migration...');

    // Initialize Supabase Client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Initialize MongoDB Client
    const mongoClient = new MongoClient(MONGODB_URI);

    try {
        await mongoClient.connect();
        console.log('Connected to MongoDB');
        const db = mongoClient.db(MONGODB_DB_NAME);

        for (const tableName of tablesToMigrate) {
            console.log(`Migrating table: ${tableName}...`);
            
            // Fetch all data from Supabase
            // Note: If table has many rows, this might need pagination
            const { data, error } = await supabase
                .from(tableName)
                .select('*');

            if (error) {
                console.error(`Error fetching from Supabase table ${tableName}:`, error.message);
                continue;
            }

            if (!data || data.length === 0) {
                console.log(`No data found in table ${tableName}. Skipping.`);
                continue;
            }

            // Create collection name (replace spaces with underscores if desired)
            const collectionName = tableName.replace(/ /g, '_');
            const collection = db.collection(collectionName);

            // Clear existing data in collection (optional, depending on use case)
            // await collection.deleteMany({});

            // Insert data into MongoDB
            const result = await collection.insertMany(data);
            console.log(`Successfully migrated ${result.insertedCount} rows to MongoDB collection ${collectionName}.`);
        }

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await mongoClient.close();
    }
}

migrate();
