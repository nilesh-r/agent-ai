from pymongo import MongoClient
import os
import sys

# Add backend to path
sys.path.insert(0, r'c:\Users\niles\OneDrive\Desktop\agent ai\backend')

from app.core.config import get_settings

def check():
    s = get_settings()
    client = MongoClient(s.DATABASE_URL)
    db = client.get_database(s.DATABASE_NAME)
    
    u_count = db.users.count_documents({})
    p_count = db.profiles.count_documents({})
    print(f"Users: {u_count}")
    print(f"Profiles: {p_count}")
    
    print("\nRecent Users:")
    for u in db.users.find().limit(3):
        print(f" - {u.get('email')} ({u.get('_id')})")
        
    print("\nRecent Profiles:")
    for p in db.profiles.find().limit(3):
        print(f" - For user_id: {p.get('user_id')}, Title: {p.get('title')}")

if __name__ == "__main__":
    check()
