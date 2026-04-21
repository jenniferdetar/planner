import json
import os
import urllib.parse
from pymongo import MongoClient
import certifi

# MongoDB Configuration from migrate_to_mongodb.js
user = "jennifermsamples_db_user"
password = "0ct052013"
quoted_user = urllib.parse.quote_plus(user)
quoted_password = urllib.parse.quote_plus(password)
MONGODB_URI = f'mongodb+srv://{quoted_user}:{quoted_password}@cluster0.tnqqlzj.mongodb.net/planner_2026?authSource=admin&retryWrites=true&w=majority'
MONGODB_DB_NAME = 'planner_2026'

json_files = [
    'nook_books.json',
    'schema.json',
    'vercel.json'
]

def push_json_to_mongo():
    # Initialize MongoDB Client with certifi for SSL and allow invalid certificates as a fallback
    mongo_client = MongoClient(MONGODB_URI, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)

    try:
        db = mongo_client[MONGODB_DB_NAME]
        print("Connected to MongoDB")

        for file_name in json_files:
            if not os.path.exists(file_name):
                print(f"File not found: {file_name}")
                continue

            print(f"Processing {file_name}...")
            with open(file_name, 'r') as f:
                try:
                    data = json.load(f)
                except Exception as e:
                    print(f"Error parsing {file_name}: {e}")
                    continue

            # Create collection name
            collection_name = file_name.replace('.json', '')
            collection = db[collection_name]

            # Handle arrays and single objects
            if isinstance(data, list):
                if len(data) > 0:
                    result = collection.insert_many(data)
                    print(f"Inserted {len(result.inserted_ids)} documents from {file_name} into collection {collection_name}")
                else:
                    print(f"Array in {file_name} is empty. Skipping.")
            else:
                result = collection.insert_one(data)
                print(f"Inserted 1 document from {file_name} into collection {collection_name}")

        print("Finished pushing JSON to MongoDB")
    except Exception as e:
        print(f"Failed to push JSON to MongoDB: {e}")
    finally:
        mongo_client.close()

if __name__ == "__main__":
    push_json_to_mongo()
