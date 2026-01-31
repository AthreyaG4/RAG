from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

DATABASE_URL = (
    f"postgresql://{settings.DB_USER}:"
    f"{settings.DB_PASSWORD}@"
    f"{settings.DB_HOST}:"
    f"{settings.DB_PORT}/"
    f"{settings.DB_NAME}"
)

engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    Base.metadata.create_all(bind=engine)
    print("Tables created")

    with engine.connect() as conn:
        conn.execute(
            text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_trigger WHERE tgname = 'chunks_search_vector_trigger'
                ) THEN
                    CREATE TRIGGER chunks_search_vector_trigger
                    BEFORE INSERT OR UPDATE ON chunks
                    FOR EACH ROW EXECUTE FUNCTION chunks_search_vector_update();
                END IF;
            END $$;
        """)
        )
        conn.commit()
    print("Trigger created")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
