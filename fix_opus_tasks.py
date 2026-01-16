import os
import psycopg2

database_url = "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

try:
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    with conn.cursor() as cur:
        # Create opus_tasks if it doesn't exist
        cur.execute("""
            CREATE TABLE IF NOT EXISTS opus_tasks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID,
                title TEXT NOT NULL,
                description TEXT,
                due_date DATE,
                due_time TIME,
                priority TEXT,
                completed BOOLEAN DEFAULT FALSE,
                linked_goal_ids TEXT[],
                category TEXT,
                subtasks JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)
        print("Ensured opus_tasks table exists.")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
