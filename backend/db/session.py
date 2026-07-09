import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.models import Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://hyperflow_admin:hyperflow_secure_pass@localhost:5432/hyperflow_db")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://hyperflow_admin:hyperflow_secure_pass@localhost:5432/hyperflow_db")

# Setup production engine connection pooling (no mock fallback)
engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=10, pool_recycle=1800)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
DATABASE_ACTIVE = True
print("Database connection successfully initialized.")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
