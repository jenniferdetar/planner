import urllib.parse
from pymongo import MongoClient

user = "jennifermsamples_db_user"
password = "al-gjS6jf_q01hajcZ9ZZtUaCORZp0eUxBfYy4uL5q1dN9"
quoted_password = urllib.parse.quote_plus(password)

# Try with authSource=admin
uri = f"mongodb+srv://{user}:{quoted_password}@cluster0.tnqqlzj.mongodb.net/planner_2026?authSource=admin&retryWrites=true&w=majority"

print(f"Testing URI: mongodb+srv://{user}:REDACTED@cluster0.tnqqlzj.mongodb.net/...")
client = MongoClient(uri, serverSelectionTimeoutMS=5000)
try:
    client.admin.command('ping')
    print("SUCCESS!")
except Exception as e:
    print(f"FAILED: {e}")
finally:
    client.close()
