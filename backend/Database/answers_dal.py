import uuid
from typing import Iterable, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from Database.models import Answers, Question
from Database.config import async_session


class AnswersDAL:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_answers(self, exam_id: uuid.UUID, student_id: uuid.UUID) -> List[Answers]:
        stmt = (
            select(Answers)
            .join(Question, Answers.question_id == Question.id)
            .where(
                Question.exam_id == exam_id,
                Answers.student_id == student_id,
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def add_answers(self, answers: Iterable[Answers]) -> None:
        self.session.add_all(answers)
        await self.session.commit()

    async def update_answers(self, answers: Iterable[Answers]) -> None:
        for ans in answers:
            query = select(Answers).where(Answers.id == ans.id)
            result = await self.session.execute(query)
            existing_ans = result.scalar()
            if existing_ans:
                existing_ans.answer = ans.answer
                existing_ans.marks = ans.marks

        await self.session.commit()

    async def delete_answers(self, exam_id: uuid.UUID, student_id: uuid.UUID) -> int:
        query = (
            select(Answers)
            .join(Question, Answers.question_id == Question.id)
            .where(
                Question.exam_id == exam_id,
                Answers.student_id == student_id,
            )
        )
        result = await self.session.execute(query)
        answers_to_delete = result.scalars().all()

        count = len(answers_to_delete)
        for ans in answers_to_delete:
            await self.session.delete(ans)

        await self.session.commit()
        return count


async def get_answers_dal():
    async with async_session() as session:
        return AnswersDAL(session)
