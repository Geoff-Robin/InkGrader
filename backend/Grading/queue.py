import os
import logging

import redis.asyncio as redis

from Grading.models import GradingInfo

logger = logging.getLogger(__name__)

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
GRADING_TASK_QUEUE = "grading_task_queue"
GRADING_UPDATES_CHANNEL = "grading_updates"

redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)


async def enqueue_grading_job(info: GradingInfo) -> None:
    await redis_client.rpush(GRADING_TASK_QUEUE, info.model_dump_json())


async def publish_grading_update(payload: dict) -> None:
    import json
    await redis_client.publish(GRADING_UPDATES_CHANNEL, json.dumps(payload))


async def run_grading_worker() -> None:
    from Grading.grading_task import process_grading_job

    logger.info(f"Grading worker started, listening on '{GRADING_TASK_QUEUE}'.")
    while True:
        try:
            item = await redis_client.blpop([GRADING_TASK_QUEUE], timeout=0)
            if item is None:
                continue
            _, raw = item
            info = GradingInfo.model_validate_json(raw)
            await process_grading_job(info)
        except Exception as e:
            logger.error(f"Grading worker iteration failed: {e}")
