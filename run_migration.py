import os
import psycopg2
from dotenv import load_dotenv

# Load .env.local from the REPO directory
env_path = os.path.join(os.getcwd(), 'REPO', '.env.local')
load_dotenv(env_path)

database_url = os.getenv('DATABASE_URL')
migration_path = os.path.join(os.getcwd(), 'REPO', 'supabase', 'migrations', '20260114100000_unify_schema_and_merge.sql')

if not database_url:
    print("DATABASE_URL not found in environment")
    exit(1)

try:
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    with conn.cursor() as cur:
        with open(migration_path, 'r') as f:
            sql = f.read()
            print(f"Executing migration from {migration_path}...")
            cur.execute(sql)
            print("Migration successful!")
    conn.close()
except Exception as e:
    print(f"Error executing migration: {e}")
    exit(1)
