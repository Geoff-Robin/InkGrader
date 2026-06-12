import logging
import uuid
from contextlib import asynccontextmanager

from sqlalchemy import text

from Database.config import engine

logger = logging.getLogger(__name__)


@asynccontextmanager
async def student_grading_lock(student_id: uuid.UUID):
    """
    Postgres advisory lock keyed on student_id, so two workers racing on the
    same student (e.g. a job dequeued more than once) don't grade it twice.
    No-op on non-Postgres engines (local sqlite dev).
    """
    if engine.dialect.name != "postgresql":
        yield True
        return

    async with engine.connect() as conn:
        result = await conn.execute(
            text("SELECT pg_try_advisory_lock(hashtextextended(:key, 0))"),
            {"key": str(student_id)},
        )
        acquired = bool(result.scalar())
        try:
            yield acquired
        finally:
            if acquired:
                await conn.execute(
                    text("SELECT pg_advisory_unlock(hashtextextended(:key, 0))"),
                    {"key": str(student_id)},
                )
