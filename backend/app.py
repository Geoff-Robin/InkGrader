"""
This is the main entry point for the FastAPI application.

It sets up the database connection, middleware, and API routes.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from dotenv import load_dotenv
import os
from config import origins
from Auth.routes import auth_router
from routes import exam_router
from fastapi.middleware.cors import CORSMiddleware
from Database.config import get_engine
from Database.models import Base

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    engine = await get_engine()
    if(os.environ["DEV"] == "true"):
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()
app = FastAPI(lifespan=lifespan, debug=True)

app.include_router(exam_router, prefix="/api/exam")
app.include_router(auth_router, prefix="/api/auth")

@app.post("/api")
async def root():
    return {"message": "Welcome to the InkGrader API"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
