from typing import Iterable, List

from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.engine import CursorResult
from typing import cast

from Database.models import Answers, Question
from Database.config import async_session


class AnswersDAL:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_answers(self, exam_id: int, user_id: int) -> List[Answers]:
        stmt = (
            select(Answers)
            .join(Question, Answers.question_id == Question.id)
            .where(
                Question.exam_id == exam_id,
                Answers.student_id == user_id,
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def add_answers(self, answers: Iterable[Answers]) -> None:
        self.session.add_all(answers)
        await self.session.commit()

    async def update_answers(self, answers: Iterable[Answers]) -> None:
        for ans in answers:
            stmt = (
                update(Answers)
                .where(Answers.id == ans.id)
                .values(answer=ans.answer)
            )
            await self.session.execute(stmt)

        await self.session.commit()

    async def delete_answers(self, exam_id: int, user_id: int) -> int:
        stmt = delete(Answers).where(
            Answers.student_id == user_id,
            Answers.question_id.in_(
                select(Question.id).where(Question.exam_id == exam_id)
            ),
        )
        result = await self.session.execute(stmt)
        await self.session.commit()

        cursor_result = cast(CursorResult, result)
        return cursor_result.rowcount or 0


async def get_answers_dal():
    async with async_session() as session:
        yield AnswersDAL(session)
