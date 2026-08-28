"""
WebSocket gateway: relays grading-completion events (published by the grading
worker over Redis pub/sub) to browsers watching a given exam.
"""

import os
import sys
import json
import asyncio
import logging
from contextlib import asynccontextmanager
from collections import defaultdict

from dotenv import load_dotenv

load_dotenv()

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import redis.asyncio as redis
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
GRADING_UPDATES_CHANNEL = "grading_updates"

exam_connections: dict[str, set[WebSocket]] = defaultdict(set)


async def relay_grading_updates():
    client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
    pubsub = client.pubsub()
    await pubsub.subscribe(GRADING_UPDATES_CHANNEL)
    logger.info(f"Subscribed to '{GRADING_UPDATES_CHANNEL}'.")
    try:
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue
            try:
                payload = json.loads(message["data"])
            except (TypeError, ValueError):
                continue
            exam_id = payload.get("exam_id")
            if not exam_id:
                continue
            dead = set()
            for ws in exam_connections.get(exam_id, ()):
                try:
                    await ws.send_json(payload)
                except Exception:
                    dead.add(ws)
            exam_connections[exam_id].difference_update(dead)
    finally:
        await pubsub.unsubscribe(GRADING_UPDATES_CHANNEL)
        await client.aclose()


@asynccontextmanager
async def lifespan(app: FastAPI):
    relay_task = asyncio.create_task(relay_grading_updates())
    yield
    relay_task.cancel()

app = FastAPI(lifespan=lifespan, debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/exam/{exam_id}")
async def exam_updates(websocket: WebSocket, exam_id: str):
    await websocket.accept()
    exam_connections[exam_id].add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        exam_connections[exam_id].discard(websocket)


@app.get("/api/health")
async def check_health():
    return {"message": "Grading updates gateway"}
