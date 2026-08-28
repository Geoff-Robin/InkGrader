"""
Standalone entrypoint for the grading worker.

Runs run_grading_worker() (Grading/queue.py) in its own process, independent
of the API. Safe to run multiple replicas concurrently: job claiming uses
`FOR UPDATE SKIP LOCKED` and per-student grading is guarded by a Postgres
advisory lock (see Database/locks.py).
"""

import asyncio
import logging
import sys
from dotenv import load_dotenv

load_dotenv()

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from Grading import run_grading_worker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main():
    task = asyncio.create_task(run_grading_worker())
    try:
        await task
    except asyncio.CancelledError:
        pass


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
