import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.models import Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://hyperflow_admin:hyperflow_secure_pass@localhost:5432/hyperflow_db")

try:
    # Setup connection engine with a short timeout to prevent startup hangs in sandbox environments
    engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 3})
    with engine.connect() as conn:
        pass
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    DATABASE_ACTIVE = True
    print("Database connection successfully initialized.")
except Exception as e:
    engine = None
    SessionLocal = None
    DATABASE_ACTIVE = False
    print(f"Database connection offline ({e}). Running in mock-active memory mode.")

def get_db():
    if not DATABASE_ACTIVE:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
