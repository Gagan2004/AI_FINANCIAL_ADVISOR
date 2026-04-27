import os
import sys

# Append the current directory to sys.path so we can import from the backend module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, auth
from datetime import datetime, timedelta
import random

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

def seed_database():
    db: Session = SessionLocal()
    try:
        # Check if user already exists
        email = "demo@finsmart.com"
        existing_user = db.query(models.User).filter(models.User.email == email).first()
        
        if existing_user:
            print(f"User {email} already exists. Cleaning up their old transactions...")
            db.query(models.Transaction).filter(models.Transaction.user_id == existing_user.id).delete()
            user = existing_user
        else:
            print(f"Creating new demo user: {email} / password: password123")
            hashed_password = auth.get_password_hash("password123")
            user = models.User(email=email, full_name="Demo User", hashed_password=hashed_password)
            db.add(user)
            db.commit()
            db.refresh(user)

        # Generate realistic transactions
        print("Generating dummy transactions...")
        categories = {
            "Income": ["Salary", "Freelance", "Investment Dividend"],
            "Expense": ["Groceries", "Rent", "Utilities", "Entertainment", "Dining Out", "Transportation"]
        }
        
        transactions_to_add = []
        now = datetime.utcnow()
        
        # Add a big initial income
        transactions_to_add.append(models.Transaction(
            user_id=user.id,
            amount=5200.00,
            category="Salary",
            description="Monthly Tech Salary",
            date=now - timedelta(days=28)
        ))

        # Add assorted random expenses and incomes over the last 30 days
        for i in range(25):
            days_ago = random.randint(0, 30)
            t_type = "expense" if random.random() > 0.15 else "income"
            
            if t_type == "expense":
                category = random.choice(categories["Expense"])
                amount = -round(random.uniform(10.0, 150.0), 2)
                if category == "Rent":
                    amount = -1200.00
            else:
                category = random.choice(categories["Income"])
                amount = round(random.uniform(50.0, 500.0), 2)

            transactions_to_add.append(models.Transaction(
                user_id=user.id,
                amount=amount,
                category=category,
                description=f"Dummy {category} transaction",
                date=now - timedelta(days=days_ago)
            ))

        db.add_all(transactions_to_add)
        db.commit()
        
        print(f"Successfully seeded database with 1 user and {len(transactions_to_add)} transactions.")
        print("--------------------------------------------------")
        print("Login details:")
        print(f"Email: {email}")
        print("Password: password123")
        print("--------------------------------------------------")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
