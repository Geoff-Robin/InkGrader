import pytest
from Database.student_dal import StudentDAL
from Database.exam_dal import ExamDAL
from Database.questions_dal import QuestionDAL
from Database.answers_dal import AnswersDAL
from Database.knowledge_base_dal import KnowledgeBaseDAL
from Database.models import Student, Exam, Question, Answers, KnowledgeBase

@pytest.mark.asyncio
async def test_student_dal(db_session):
    student_dal = StudentDAL(db_session)

    # Test create student
    student = await student_dal.create_student(marks=95)
    assert student.id is not None
    assert student.marks == 95

    # Test get student
    fetched = await student_dal.get_student(student.id)
    if not fetched:
        raise RuntimeError("fetched variable is None")
    else:
        assert fetched.marks == 95

    # Test update student
    updated = await student_dal.update_student(student.id, marks=100)
    if updated:
        assert updated.marks == 100
    else:
        raise RuntimeError("updated variable is None")

    # Test delete student
    await student_dal.delete_student(student.id)
    assert await student_dal.get_student(student.id) is None

@pytest.mark.asyncio
async def test_exam_dal(db_session):
    exam_dal = ExamDAL(db_session)
    exam = Exam(user_id="dummy_user_1", exam_name="Midterm")
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
    exam_dal = ExamDAL(db_session)
    exam = Exam(user_id="dummy_user_2", exam_name="Test Exam")
    await exam_dal.create_exam(exam)

    question_dal = QuestionDAL(db_session)
    q1 = Question(exam_id=exam.id, question_number="1", text="What is 2+2?", max_marks=5, topic="Math", question_type="Short")
    q2 = Question(exam_id=exam.id, question_number="2", text="What is 3+3?", max_marks=5, topic="Math", question_type="Short")

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
    student_dal = StudentDAL(db_session)
    student = await student_dal.create_student(marks=0)

    exam_dal = ExamDAL(db_session)
    exam = Exam(user_id="dummy_user_3", exam_name="Test Exam 2")
    await exam_dal.create_exam(exam)

    question_dal = QuestionDAL(db_session)
    q1 = Question(exam_id=exam.id, question_number="1", text="What is 2+2?", max_marks=5, topic="Math", question_type="Short")
    await question_dal.add_question(q1)

    answers_dal = AnswersDAL(db_session)
    ans1 = Answers(student_id=student.id, question_id=q1.id, answer="4", rubrics="Correct Answer: 4")

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

@pytest.mark.asyncio
async def test_knowledge_base_dal(db_session):
    exam_dal = ExamDAL(db_session)
    exam = Exam(user_id="dummy_kb_user", exam_name="KB Exam")
    await exam_dal.create_exam(exam)

    kb_dal = KnowledgeBaseDAL(db_session)
    kb1 = KnowledgeBase(exam_id=exam.id, content="Some content 1", vector=[0.1, 0.2, 0.3])
    kb2 = KnowledgeBase(exam_id=exam.id, content="Some content 2", vector=[0.4, 0.5, 0.6])

    await kb_dal.add_knowledge([kb1, kb2])

    kbs = await kb_dal.get_knowledge(exam.id)
    assert len(kbs) == 2
    assert kbs[0].content in ["Some content 1", "Some content 2"]

    await kb_dal.delete_knowledge(exam.id)
    kbs_after = await kb_dal.get_knowledge(exam.id)
    assert len(kbs_after) == 0
