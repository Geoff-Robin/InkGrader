from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
import os

db_url = ""
if(os.getenv("POSTGRES_URL_PROD")):
    db_url = os.environ["POSTGRES_URL_PROD"]
elif(os.getenv("POSTGRES_URL_DEV")):
    db_url = os.environ["POSTGRES_URL_DEV"]
else:
    db_url = "sqlite+aiosqlite:///./test.db"
engine = create_async_engine(db_url, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
async def get_engine():
    return engine
