import os
import asyncio
import logging
import uuid

import redis.asyncio as redis

from Grading.models import GradingInfo
from Database.config import async_session
from Database.grading_job_dal import GradingJobDAL
from Database.models import GradingJob

logger = logging.getLogger(__name__)

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
GRADING_UPDATES_CHANNEL = "grading_updates"
POLL_INTERVAL_SECONDS = float(os.environ.get("GRADING_WORKER_POLL_INTERVAL", "1.0"))
BATCH_SIZE = int(os.environ.get("GRADING_WORKER_BATCH_SIZE", "10"))

redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)


async def enqueue_grading_job(info: GradingInfo) -> None:
    async with async_session() as session:
        dal = GradingJobDAL(session)
        await dal.enqueue_batch(
            exam_id=info.exam_id,
            student_ids=info.student_ids,
            priority=info.priority,
        )


async def publish_grading_update(payload: dict) -> None:
    import json
    await redis_client.publish(GRADING_UPDATES_CHANNEL, json.dumps(payload))


async def _process_exam_group(exam_id: uuid.UUID, jobs: list[GradingJob]) -> None:
    from Grading.grading_task import process_grading_job

    info = GradingInfo(exam_id=exam_id, student_ids=[job.student_id for job in jobs])
    results = await process_grading_job(info)

    succeeded = [job.id for job in jobs if results.get(job.student_id)]
    failed = [job.id for job in jobs if not results.get(job.student_id)]

    async with async_session() as session:
        await GradingJobDAL(session).mark_statuses(succeeded, failed)


async def claim_and_process_batch() -> int:
    """
    Claim up to BATCH_SIZE queued jobs, grouped by exam so question-loading
    and the GradingAgent are still built once per exam rather than once per
    student. Returns the number of jobs claimed (0 means the queue was empty).
    """
    async with async_session() as session:
        claimed = await GradingJobDAL(session).claim_batch(limit=BATCH_SIZE)

    if not claimed:
        return 0

    by_exam: dict[uuid.UUID, list[GradingJob]] = {}
    for job in claimed:
        by_exam.setdefault(job.exam_id, []).append(job)

    await asyncio.gather(
        *(_process_exam_group(exam_id, jobs) for exam_id, jobs in by_exam.items())
    )

    return len(claimed)


async def run_grading_worker() -> None:
    logger.info("Grading worker started, polling 'grading_jobs'.")
    while True:
        try:
            claimed = await claim_and_process_batch()
            if not claimed:
                await asyncio.sleep(POLL_INTERVAL_SECONDS)
        except Exception as e:
            logger.error(f"Grading worker iteration failed: {e}")
            await asyncio.sleep(POLL_INTERVAL_SECONDS)
