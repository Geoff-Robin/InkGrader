from huggingface_hub import InferenceClient
from Database import get_knowledge_base_dal
import logging
import uuid

logger = logging.getLogger(__name__)

async def retreive_similar_chunks(query_vector: list[float], exam_id: uuid.UUID):
    knowledge_base_dal = await get_knowledge_base_dal()
    similar_kbs = await knowledge_base_dal.get_similar_knowledge(exam_id, query_vector, top_k=5)
    return similar_kbs


async def rag_tool(query: str):
    client = InferenceClient()
    query_vector = client.feature_extraction(query, model="sentence-transformers/all-MiniLM-L6-v2")
    query_vector = query_vector.tolist()
    chunks = await retreive_similar_chunks(query_vector, uuid.UUID())
    return '\n'.join([chunk.content for chunk in chunks])
