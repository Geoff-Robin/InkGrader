from huggingface_hub import InferenceClient
from Database.config import async_session
from Database.knowledge_base_dal import KnowledgeBaseDAL
import logging
import uuid
import os

logger = logging.getLogger(__name__)

async def retreive_similar_chunks(query_vector: list[float], exam_id: uuid.UUID):
    async with async_session() as session:
        knowledge_base_dal = KnowledgeBaseDAL(session)
        similar_kbs = await knowledge_base_dal.get_similar_knowledge(exam_id, query_vector, top_k=5)
        return similar_kbs
async def rag_tool(query: str):
    client = InferenceClient(api_key=os.environ["HF_API_KEY"])
    query_vector = client.feature_extraction(query, model="sentence-transformers/all-MiniLM-L6-v2")
    query_vector = query_vector.tolist()
    chunks = await retreive_similar_chunks(query_vector, uuid.UUID())
    return '\n'.join([chunk.content for chunk in chunks])
