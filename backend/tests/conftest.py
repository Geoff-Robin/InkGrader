import pytest
import pytest_asyncio
import os
import sys
import asyncio

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from Database.models import Base
from dotenv import load_dotenv

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

load_dotenv()

@pytest_asyncio.fixture(scope="function")
async def db_session():
    # Use POSTGRES_URL_DEV for database connection as requested
    database_url = os.environ.get("POSTGRES_URL_DEV")
    if not database_url:
        pytest.fail("POSTGRES_URL_DEV environment variable is not set in .env")

    engine = create_async_engine(database_url, echo=False)

    async with engine.begin() as conn:
        # Recreate tables for a clean state in each test
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with Session() as session:
        yield session

    # Cleanup after test
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()
