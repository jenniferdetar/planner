import os
import urllib.parse
from supabase import create_client, Client
from pymongo import MongoClient

# Supabase Configuration
SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co'
SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE'

# MongoDB Configuration
user = "jennifermsamples_db_user"
password = "al-gjS6jf_q01hajcZ9ZZtUaCORZp0eUxBfYy4uL5q1dN9"
quoted_user = urllib.parse.quote_plus(user)
quoted_password = urllib.parse.quote_plus(password)
MONGODB_URI = f'mongodb+srv://{quoted_user}:{quoted_password}@cluster0.tnqqlzj.mongodb.net/?appName=Cluster0'
MONGODB_DB_NAME = 'planner_2026'

tables_to_migrate = [
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
]

def migrate():
    print("Starting migration...")

    # Initialize Supabase Client with Service Role Key for full access
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    # Initialize MongoDB Client
    mongo_client = MongoClient(MONGODB_URI)

    try:
        db = mongo_client[MONGODB_DB_NAME]
        print("Connected to MongoDB")

        for table_name in tables_to_migrate:
            print(f"Migrating table: {table_name}...")
            
            # Fetch data from Supabase
            response = supabase.table(table_name).select("*").execute()
            data = response.data

            if not data:
                print(f"No data found in table {table_name}. Skipping.")
                continue

            # Create collection name
            collection_name = table_name.replace(' ', '_')
            collection = db[collection_name]

            # Insert data into MongoDB
            result = collection.insert_many(data)
            print(f"Successfully migrated {len(result.inserted_ids)} rows to MongoDB collection {collection_name}.")

        print("Migration completed successfully!")
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        mongo_client.close()

if __name__ == "__main__":
    migrate()
