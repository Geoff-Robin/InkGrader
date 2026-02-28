import pytest
from Database.user_dal import UserDAL
from Database.exam_dal import ExamDAL
from Database.questions_dal import QuestionDAL
from Database.answers_dal import AnswersDAL
from Database.models import User, Exam, Question, Answers

@pytest.mark.asyncio
async def test_user_dal(db_session):
    user_dal = UserDAL(db_session)

    # Test create teacher
    teacher = await user_dal.create_user(role="teacher", email="t@test.com", password="pwd")
    assert teacher.id is not None
    assert teacher.role == "teacher"

    # Test get user
    fetched = await user_dal.get_user(teacher.id)
    if(not fetched):
        raise RuntimeError("fetched variable is None")
    else:
        assert fetched.email == "t@test.com"

    # Test update user
    updated = await user_dal.update_user(teacher.id, email="new@test.com")
    if(updated):
        assert updated.email == "new@test.com"
    else:
        raise RuntimeError("updated variable is None")

    # Test create student
    student = await user_dal.create_user(role="student", marks=95)
    assert student.id is not None
    assert student.marks == 95

    # Test delete user
    await user_dal.delete_user(student.id)
    assert await user_dal.get_user(student.id) is None

@pytest.mark.asyncio
async def test_exam_dal(db_session):
    user_dal = UserDAL(db_session)
    teacher = await user_dal.create_user(role="teacher", email="t2@test.com", password="pwd")

    exam_dal = ExamDAL(db_session)
    exam = Exam(teacher_id=teacher.id, exam_name="Midterm")
    await exam_dal.create_exam(exam)

    assert exam.id is not None

    fetched = await exam_dal.get_exam(exam.id)
    if(not fetched):
        raise RuntimeError("fetched variable is None")
    else:
        assert fetched.exam_name  == "Midterm"

    fetched.exam_name = "Final"
    await exam_dal.update_exam(fetched)

    fetched_updated = await exam_dal.get_exam(exam.id)

    if(not fetched_updated):
        raise RuntimeError("fetched_updated variable is None")
    else:
        assert fetched_updated.exam_name == "Final"

    await exam_dal.delete_exam(exam.id)
    assert await exam_dal.get_exam(exam.id) is None

@pytest.mark.asyncio
async def test_question_dal(db_session):
    # Setup
    user_dal = UserDAL(db_session)
    teacher = await user_dal.create_user(role="teacher", email="t3@test.com", password="pwd")

    exam_dal = ExamDAL(db_session)
    exam = Exam(teacher_id=teacher.id, exam_name="Test Exam")
    await exam_dal.create_exam(exam)

    question_dal = QuestionDAL(db_session)
    q1 = Question(exam_id=exam.id, text="What is 2+2?")
    q2 = Question(exam_id=exam.id, text="What is 3+3?")

    await question_dal.add_questions([q1, q2])

    questions = await question_dal.get_questions(exam.id)
    assert len(questions) == 2

    q_fetched = await question_dal.get_question(q1.id, exam.id)
    assert q_fetched.text == "What is 2+2?"

    await question_dal.update_question(q1.id, exam.id, "What is 4+4?")
    q_updated = await question_dal.get_question(q1.id, exam.id)
    assert q_updated.text == "What is 4+4?"

    await question_dal.delete_question(q1.id, exam.id)
    questions_after = await question_dal.get_questions(exam.id)
    assert len(questions_after) == 1

@pytest.mark.asyncio
async def test_answers_dal(db_session):
    # Setup
    user_dal = UserDAL(db_session)
    teacher = await user_dal.create_user(role="teacher", email="t4@test.com", password="pwd")
    student = await user_dal.create_user(role="student", marks=0)

    exam_dal = ExamDAL(db_session)
    exam = Exam(teacher_id=teacher.id, exam_name="Test Exam 2")
    await exam_dal.create_exam(exam)

    question_dal = QuestionDAL(db_session)
    q1 = Question(exam_id=exam.id, text="What is 2+2?")
    await question_dal.add_question(q1)

    answers_dal = AnswersDAL(db_session)
    ans1 = Answers(student_id=student.id, question_id=q1.id, answer="4")

    await answers_dal.add_answers([ans1])

    answers = await answers_dal.get_answers(exam.id, student.id)
    assert len(answers) == 1
    assert answers[0].answer == "4"

    ans1.answer = "5"
    await answers_dal.update_answers([ans1])

    answers_updated = await answers_dal.get_answers(exam.id, student.id)
    assert answers_updated[0].answer == "5"

    await answers_dal.delete_answers(exam.id, student.id)
    answers_after = await answers_dal.get_answers(exam.id, student.id)
    assert len(answers_after) == 0
