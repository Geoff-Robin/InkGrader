import asyncio
import logging
import os
import uuid

from huggingface_hub import InferenceClient

from Database.config import async_session
from Database.knowledge_base_dal import KnowledgeBaseDAL

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


async def retrieve_similar_chunks(
    query_vector: list[float], exam_id: uuid.UUID, top_k: int = 5
):
    async with async_session() as session:
        knowledge_base_dal = KnowledgeBaseDAL(session)
        similar_kbs = await knowledge_base_dal.get_similar_knowledge(
            exam_id, query_vector, top_k=top_k
        )
        return similar_kbs


async def rag_tool(query: str, exam_id: uuid.UUID, top_k: int = 5) -> str:
    """Retrieve the reference chunks most relevant to a grading query."""
    client = InferenceClient(api_key=os.environ["HF_API_KEY"])
    query_vector = await asyncio.to_thread(
        client.feature_extraction, query, model=EMBEDDING_MODEL
    )
    if hasattr(query_vector, "tolist"):
        query_vector = query_vector.tolist()

    chunks = await retrieve_similar_chunks(query_vector, exam_id, top_k=top_k)
    return "\n\n".join(chunk.content for chunk in chunks)
