from sqlalchemy.ext.asyncio import AsyncSession
from Database.config import async_session
from Database.models import Exam

class ExamDAL:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_exam(self, exam: Exam):
        self.session.add(exam)
        await self.session.commit()

    async def get_exam(self, exam_id: int):
        exam = await self.session.get(Exam, exam_id)
        return exam

    async def update_exam(self, exam: Exam):
        self.session.add(exam)
        await self.session.commit()

    async def delete_exam(self, exam_id: int):
        exam = await self.session.get(Exam, exam_id)
        if exam:
            await self.session.delete(exam)
            await self.session.commit()

async def get_exam_dal():
    async with async_session() as session:
        return ExamDAL(session)
