import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm.session import query
from Database.config import async_session
from Database.models import Exam

class ExamDAL:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_exam(self, exam: Exam):
        query = select(Exam).where(Exam.user_id == exam.user_id)
        existing_exam = await self.session.execute(query)
        if existing_exam.scalar():
            raise ValueError("Exam already exists for this user")
        self.session.add(exam)
        await self.session.commit()

    async def get_exams(self, user_id: str):
        query = select(Exam).where(Exam.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_exam(self, exam_id: uuid.UUID):
        query = select(Exam).where(Exam.id == exam_id)
        result = await self.session.execute(query)
        return result.scalar()

    async def update_exam(self, exam: Exam):
        self.session.add(exam)
        await self.session.commit()

    async def delete_exam(self, exam_id: uuid.UUID):
        query = select(Exam).where(Exam.id == exam_id)
        result = await self.session.execute(query)
        exam = result.scalar()
        if exam:
            await self.session.delete(exam)
            await self.session.commit()

async def get_exam_dal() -> ExamDAL:
    async with async_session() as session:
        return ExamDAL(session)
