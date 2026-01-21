
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT_DIR, '.env.local');

function loadEnvFromFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const contents = fs.readFileSync(filePath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return;
    const key = match[1];
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  });
}

loadEnvFromFile(ENV_FILE);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('DATABASE_URL is missing from .env.local');
    process.exit(1);
}

const migrations = [
    '20260112100000_csea_members_and_issues.sql',
    '20260120110000_update_csea_issues_and_seed_data.sql',
    '20260120120000_create_opus_metadata.sql'
];

async function applyMigrations() {
    const client = new Client({
        connectionString: DATABASE_URL.replace('db.hhhuidbnvbtllxcaiusl.supabase.co', 'aws-0-us-west-2.pooler.supabase.com').replace('postgres:', 'postgres.hhhuidbnvbtllxcaiusl:'),
    });

    try {
        await client.connect();
        console.log('Connected to database');

        for (const migration of migrations) {
            console.log(`Applying ${migration}...`);
            const filePath = path.join(ROOT_DIR, 'supabase', 'migrations', migration);
            const sql = fs.readFileSync(filePath, 'utf8');
            await client.query(sql);
            console.log(`Successfully applied ${migration}`);
        }
    } catch (err) {
        console.error('Error applying migrations:', err);
    } finally {
        await client.end();
    }
}

applyMigrations();
