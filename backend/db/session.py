import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.models import Base

# Try reading from DATABASE_URL or POSTGRES_URL
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")

engine = None
SessionLocal = None
DATABASE_ACTIVE = False

def initialize_database():
    global engine, SessionLocal, DATABASE_ACTIVE
    urls_to_try = []
    if DATABASE_URL:
        urls_to_try.append(DATABASE_URL)
    # Default postgres local fallback
    urls_to_try.append("postgresql://hyperflow_admin:hyperflow_secure_pass@localhost:5432/hyperflow_db")
    # SQLite fallback
    urls_to_try.append("sqlite:////tmp/hyperflow.db")

    for url in urls_to_try:
        try:
            print(f"Attempting database init with URL: {url.split('@')[-1] if '@' in url else url}")
            if url.startswith("sqlite"):
                temp_engine = create_engine(url, connect_args={"check_same_thread": False})
            else:
                temp_engine = create_engine(url, pool_size=20, max_overflow=10, pool_recycle=1800)
            
            # Verify connectivity
            with temp_engine.connect() as conn:
                pass
            
            engine = temp_engine
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            DATABASE_ACTIVE = True
            
            # Automatically create tables if SQLite is used
            if url.startswith("sqlite"):
                Base.metadata.create_all(bind=engine)
                print("SQLite tables successfully initialized.")
                
            print(f"Database successfully connected using: {url.split('@')[-1] if '@' in url else url}")
            return
        except Exception as e:
            print(f"Failed to connect to {url.split('@')[-1] if '@' in url else url}: {str(e)}")

    # In-memory backup
    print("WARNING: Falling back to in-memory SQLite database!")
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    DATABASE_ACTIVE = True

initialize_database()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

