import uuid
from Database.config import async_session
from Database.models import Question
from sqlalchemy import select, insert
from typing import List

class QuestionDAL:
    def __init__(self, session):
        self.session = session

    async def get_questions(self, exam_id: uuid.UUID):
        questions = await self.session.execute(select(Question).where(Question.exam_id == exam_id))
        return list(questions.scalars().all())

    async def add_questions(self, questions: List[Question]):
        if questions:
            for q in questions:
                if q.id is None:
                    q.id = uuid.uuid4()
            stmt = insert(Question).values([
                {
                    "id": q.id,
                    "question_number": q.question_number,
                    "exam_id": q.exam_id,
                    "text": q.text,
                    "max_marks": q.max_marks,
                    "topic": q.topic,
                    "question_type": q.question_type,
                }
                for q in questions
            ])
            await self.session.execute(stmt)
            await self.session.commit()

    async def delete_question(self, question_id: uuid.UUID, exam_id: uuid.UUID):
        question = await self.session.execute(select(Question).where(Question.id == question_id, Question.exam_id == exam_id))
        question_scalar = question.scalar()
        if question_scalar:
            await self.session.delete(question_scalar)
            await self.session.commit()

    async def update_question(self, question_id: uuid.UUID, exam_id: uuid.UUID, text: str):
        question_obj = await self.session.execute(select(Question).where(Question.id == question_id, Question.exam_id == exam_id))
        question_scalar = question_obj.scalar()
        if question_scalar:
            question_scalar.text = text
            await self.session.commit()

    async def get_question(self, question_id: uuid.UUID, exam_id: uuid.UUID):
        question = await self.session.execute(select(Question).where(Question.id == question_id, Question.exam_id == exam_id))
        return question.scalar()

    async def add_question(self, question: Question):
        query = select(Question).where(
            Question.text == question.text,
            Question.exam_id == question.exam_id
        )
        existing_question = await self.session.execute(query)
        if existing_question.scalar():
            raise ValueError("Question already exists for this exam")
        self.session.add(question)
        await self.session.commit()


async def get_question_dal():
    async with async_session() as session:
        return QuestionDAL(session)
