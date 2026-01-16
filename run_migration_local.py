import os
import psycopg2
from dotenv import load_dotenv

# Load .env.local from the current directory
env_path = os.path.join(os.getcwd(), '.env.local')
load_dotenv(env_path)

database_url = os.getenv('DATABASE_URL')
# Fixed path to point correctly to the migrations folder
migration_path = os.path.join(os.getcwd(), 'supabase', 'migrations', '20260114100000_unify_schema_and_merge.sql')

if not database_url:
    print("DATABASE_URL not found in environment, using local default")
    database_url = "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

if not os.path.exists(migration_path):
    print(f"Error: Migration file not found at {migration_path}")
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
