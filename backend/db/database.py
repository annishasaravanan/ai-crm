from sqlalchemy import create_engine
from dotenv import load_dotenv
import os
from sqlalchemy.orm import sessionmaker

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"), override=True)

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and "+asyncpg" in DATABASE_URL:
	DATABASE_URL = DATABASE_URL.replace("+asyncpg", "+psycopg2")

if not DATABASE_URL:
	raise RuntimeError("DATABASE_URL is not configured. Add it to backend/.env before starting the API.")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)