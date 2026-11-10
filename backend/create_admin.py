
from getpass import getpass

from app.database import SessionLocal
from app.models import User
from app.auth import hash_password

db = SessionLocal()

try:
    email = "admin@civicrelief.com"

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        print("An account with this email already exists.")
        print("Existing role:", existing_user.role)
    else:
        full_name = input("Enter administrator name: ").strip()

        password = getpass("Create administrator password: ")
        confirm_password = getpass("Confirm administrator password: ")

        if len(password) < 8:
            print("Password must contain at least 8 characters.")

        elif password != confirm_password:
            print("Passwords do not match.")

        else:
            admin = User(
                full_name=full_name,
                email=email,
                password_hash=hash_password(password),
                role="admin",
                is_active=True
            )

            db.add(admin)
            db.commit()

            print("\nAdministrator account created successfully!")
            print("Email:", email)
            print("Role: admin")

finally:
    db.close()
