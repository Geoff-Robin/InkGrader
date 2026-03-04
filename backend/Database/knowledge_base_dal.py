import uuid
from typing import List

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from Database.models import KnowledgeBase
from Database.config import async_session

class KnowledgeBaseDAL:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_knowledge(self, knowledge_entries: List[KnowledgeBase]):
        self.session.add_all(knowledge_entries)
        await self.session.commit()

    async def get_knowledge(self, exam_id: uuid.UUID) -> List[KnowledgeBase]:
        query = select(KnowledgeBase).where(KnowledgeBase.exam_id == exam_id)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def delete_knowledge(self, exam_id: uuid.UUID):
        query = delete(KnowledgeBase).where(KnowledgeBase.exam_id == exam_id)
        await self.session.execute(query)
        await self.session.commit()

async def get_knowledge_base_dal():
    async with async_session() as session:
        return KnowledgeBaseDAL(session)
