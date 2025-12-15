from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import os

DATABASE_URL = (
    f"postgresql://{os.getenv('user')}:"
    f"{os.getenv('password')}@"
    f"{os.getenv('host')}:"
    f"{os.getenv('port')}/"
    f"{os.getenv('dbname')}"
)

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Tables created")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()