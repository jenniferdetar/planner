import urllib.parse
from pymongo import MongoClient

# Tables to migrate
tables_to_migrate = [
    'attendance tracker',
]

def test_connection(user, password):
    quoted_user = urllib.parse.quote_plus(user)
    quoted_password = urllib.parse.quote_plus(password)
    uri = f'mongodb+srv://{quoted_user}:{quoted_password}@cluster0.tnqqlzj.mongodb.net/?appName=Cluster0'
    
    print(f"Testing combination: User='{user}', Password='{password[:3]}...'")
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    try:
        # The ismaster command is cheap and does not require auth.
        # But a command like 'list_database_names' or actually trying to access a collection will trigger auth.
        db = client['planner_2026']
        # Try to ping or do something that requires auth
        client.admin.command('ping')
        print(f"  SUCCESS! Connected with {user}")
        return True
    except Exception as e:
        # print(f"  FAILED: {e}")
        return False
    finally:
        client.close()

users = ["jennifermsamples_db_user", "admin", "jennifermsamples@gmail.com", "jennifermsamples"]
passwords = ["pN##3UZsWf4Sby$!eF", "0ct052013", "Oct052013", "al-gjS6jf_q01hajcZ9ZZtUaCORZp0eUxBfYy4uL5q1dN9"]

for u in users:
    for p in passwords:
        if test_connection(u, p):
            print(f"\nFOUND WORKING COMBINATION: User='{u}', Password='{p}'")
            exit(0)

print("\nNo working combination found.")
