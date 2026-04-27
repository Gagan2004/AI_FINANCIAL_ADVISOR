import os
import sys
import random
from datetime import datetime, timedelta

# Append the current directory to sys.path so we can import from the backend module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, auth

def create_and_seed_user(email="newuser@example.com", password="password123", full_name="New Test User"):
    db: Session = SessionLocal()
    try:
        # 1. Create or get user
        existing_user = db.query(models.User).filter(models.User.email == email).first()
        
        if existing_user:
            print(f"User {email} already exists. Cleaning up old transactions...")
            db.query(models.Transaction).filter(models.Transaction.user_id == existing_user.id).delete()
            user = existing_user
        else:
            print(f"Creating new user: {email} / password: {password}")
            hashed_password = auth.get_password_hash(password)
            user = models.User(email=email, full_name=full_name, hashed_password=hashed_password)
            db.add(user)
            db.commit()
            db.refresh(user)

        # 2. Generate dummy transactions
        print(f"Generating dummy transactions for {email}...")
        categories = {
            "Income": ["Salary", "Freelance", "Side Hustle", "Bonus"],
            "Expense": ["Groceries", "Rent", "Subscription", "Dining Out", "Travel", "Electronics", "Fitness"]
        }
        
        transactions_to_add = []
        now = datetime.utcnow()
        
        # Add a starting balance (Income)
        transactions_to_add.append(models.Transaction(
            user_id=user.id,
            amount=4500.00,
            category="Salary",
            description="Monthly Paycheck",
            date=now - timedelta(days=25)
        ))

        # Add random transactions over the last 30 days
        for i in range(30):
            days_ago = random.randint(0, 30)
            is_income = random.random() > 0.8  # 20% chance of income
            
            if is_income:
                category = random.choice(categories["Income"])
                amount = round(random.uniform(50.0, 300.0), 2)
                description = f"Received for {category}"
            else:
                category = random.choice(categories["Expense"])
                amount = -round(random.uniform(5.0, 100.0), 2)
                if category == "Rent":
                    amount = -1100.00
                description = f"Spent on {category}"

            transactions_to_add.append(models.Transaction(
                user_id=user.id,
                amount=amount,
                category=category,
                description=description,
                date=now - timedelta(days=days_ago)
            ))

        db.add_all(transactions_to_add)
        db.commit()
        
        print(f"Successfully created user and added {len(transactions_to_add)} transactions.")
        print("-" * 50)
        print(f"Login Email: {email}")
        print(f"Password:    {password}")
        print("-" * 50)
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # You can change these values if needed
    create_and_seed_user()
