from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import DATABASE_URL

# pool_pre_ping avoids "server closed the connection" errors after the
# DB has been idle for a while (common on free-tier hosted Postgres).
# The sqlite branch only matters if you point DATABASE_URL at a local
# sqlite file for a quick test before Postgres is set up.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
