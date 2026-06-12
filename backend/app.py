"""
This is the main entry point for the FastAPI application.

It sets up the database connection, middleware, and API routes.
"""

import asyncio
import sys
from dotenv import load_dotenv

load_dotenv()

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from contextlib import asynccontextmanager
from fastapi import FastAPI
import os
from routes import exam_router
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from Database.config import get_engine
from Database.models import Base
from Grading import run_grading_worker

@asynccontextmanager
async def lifespan(app: FastAPI):
    engine = await get_engine()
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
    worker_task = asyncio.create_task(run_grading_worker())
    yield
    worker_task.cancel()
    await engine.dispose()

app = FastAPI(lifespan=lifespan, debug=True)

app.include_router(exam_router, prefix="/api/exam")

@app.get("/api/health")
async def check_health():
    return {"message": "Welcome to the InkGrader API"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
