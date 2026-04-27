import os
import sys

# Append the current directory to sys.path so we can import from the backend module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def list_users():
    db: Session = SessionLocal()
    try:
        users = db.query(models.User).all()
        if not users:
            print("No users found in the database.")
            return

        print(f"{'ID':<5} | {'Email':<25} | {'Full Name':<20} | {'Hashed Password'}")
        print("-" * 80)
        for user in users:
            print(f"{user.id:<5} | {user.email:<25} | {user.full_name or 'N/A':<20} | {user.hashed_password}")
        
    except Exception as e:
        print(f"Error connecting to database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
