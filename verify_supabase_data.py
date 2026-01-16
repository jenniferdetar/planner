import os
import django
from pathlib import Path
from dotenv import load_dotenv

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / '.env.local'
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from planner.models import OpusGoals, OpusTasks, OpusMeetings

def verify_data():
    models_to_check = [
        ("OpusGoals", OpusGoals),
        ("OpusTasks", OpusTasks),
        ("OpusMeetings", OpusMeetings),
    ]
    
    print("--- Data Retrieval Verification ---")
    for name, model in models_to_check:
        try:
            count = model.objects.count()
            print(f"✅ {name}: Successfully retrieved {count} records from {model._meta.db_table}")
        except Exception as e:
            print(f"❌ {name}: Failed to retrieve data from {model._meta.db_table}. Error: {e}")

if __name__ == "__main__":
    from django.conf import settings
    print(f"DATABASE_URL: {os.environ.get('DATABASE_URL')}")
    print(f"Using database: {settings.DATABASES['default']['ENGINE']} - {settings.DATABASES['default'].get('NAME')}")
    verify_data()
