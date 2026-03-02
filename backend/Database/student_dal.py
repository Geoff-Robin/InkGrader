import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from Database.models import Student
from Database.config import async_session


class StudentDAL:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_student(self, *, marks=None):
        student = Student(
            marks=marks,
        )
        self.session.add(student)
        await self.session.commit()
        await self.session.refresh(student)
        return student

    async def get_student(self, student_id: uuid.UUID):
        return await self.session.get(Student, student_id)

    async def update_student(
        self,
        student_id: uuid.UUID,
        *,
        marks: int | None = None,
    ):
        student = await self.session.get(Student, student_id)
        if not student:
            return None

        if marks is not None:
            student.marks = marks

        await self.session.commit()
        await self.session.refresh(student)
        return student

    async def delete_student(self, student_id: uuid.UUID):
        student = await self.session.get(Student, student_id)
        if not student:
            return None

        await self.session.delete(student)
        await self.session.commit()
        return student


async def get_student_dal():
    async with async_session() as session:
        yield StudentDAL(session)
