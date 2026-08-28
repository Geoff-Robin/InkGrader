import pytest
from unittest.mock import AsyncMock

from Database.exam_dal import ExamDAL
from Database.questions_dal import QuestionDAL
from Database.student_dal import StudentDAL
from Database.answers_dal import AnswersDAL
from Database.models import Exam, Question, Answers
from Grading.grading_task import grade_student
from Agents.models import GradingAgentOutput


@pytest.mark.asyncio
async def test_grade_student_returns_true_when_marks_persisted(db_session):
    exam_dal = ExamDAL(db_session)
    exam = Exam(user_id="u1", exam_name="Grade Task Test")
    await exam_dal.create_exam(exam)

    question_dal = QuestionDAL(db_session)
    question = Question(
        exam_id=exam.id,
        question_number="1",
        text="What is 2+2?",
        max_marks=5,
        topic="Math",
        question_type="Short",
        rubrics="Correct Answer: 4",
    )
    await question_dal.add_question(question)

    student_dal = StudentDAL(db_session)
    student = await student_dal.create_student(exam_id=exam.id, marks=None)

    answers_dal = AnswersDAL(db_session)
    answer = Answers(student_id=student.id, question_id=question.id, answer="4")
    await answers_dal.add_answers([answer])

    agent = AsyncMock()
    agent.grade.return_value = GradingAgentOutput(question_id=1, marks=4)

    result = await grade_student(exam.id, student.id, {question.id: question}, agent)

    assert result is True


@pytest.mark.asyncio
async def test_grade_student_returns_false_when_no_answers(db_session):
    exam_dal = ExamDAL(db_session)
    exam = Exam(user_id="u2", exam_name="Grade Task Test 2")
    await exam_dal.create_exam(exam)

    student_dal = StudentDAL(db_session)
    student = await student_dal.create_student(exam_id=exam.id, marks=None)

    agent = AsyncMock()

    result = await grade_student(exam.id, student.id, {}, agent)

    assert result is False
