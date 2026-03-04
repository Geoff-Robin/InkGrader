import pytest
from io import BytesIO
import uuid
from unittest.mock import patch, MagicMock, AsyncMock

from FileProcessor.utils import (
    extract_and_save_questions,
    process_rag_material,
    extract_and_save_answers,
    extract_and_save_rubric
)
from Agents.models import QuestionExtractionModel, AnswerExtractionModel, RubricExtractionModel
from Database.exam_dal import ExamDAL
from Database.questions_dal import QuestionDAL
from Database.answers_dal import AnswersDAL
from Database.knowledge_base_dal import KnowledgeBaseDAL
from Database.models import Exam, Question

@pytest.fixture(autouse=True)
def patch_dals(db_session):
    async def mock_get_question_dal():
        return QuestionDAL(db_session)
    async def mock_get_answers_dal():
        return AnswersDAL(db_session)
    async def mock_get_knowledge_base_dal():
        return KnowledgeBaseDAL(db_session)

    with patch("FileProcessor.utils.get_question_dal", side_effect=mock_get_question_dal), \
         patch("FileProcessor.utils.get_knowledge_base_dal", side_effect=mock_get_knowledge_base_dal), \
         patch("FileProcessor.helpers.get_question_dal", side_effect=mock_get_question_dal), \
         patch("FileProcessor.helpers.get_answers_dal", side_effect=mock_get_answers_dal):
        yield

@pytest.fixture
def mock_extraction_agent():
    with patch("FileProcessor.utils.ExtractionAgent") as mock:
        agent_instance = AsyncMock()

        agent_instance.extract_questions.return_value = [
            QuestionExtractionModel(
                question_id="1",
                question="What is 2+2?",
                marks=5,
                topic="Math",
                question_type="Short"
            )
        ]

        agent_instance.extract_answers.return_value = [
            AnswerExtractionModel(
                question_id="1",
                answers="4"
            )
        ]

        agent_instance.extract_rubrics.return_value = [
            RubricExtractionModel(
                question_id="1",
                rubrics="Correct Answer: 4"
            )
        ]

        mock.return_value = agent_instance
        yield agent_instance
@pytest.fixture
def mock_inference_client():
    with patch("FileProcessor.utils.InferenceClient") as mock:
        client_instance = MagicMock()
        client_instance.feature_extraction.return_value = [0.1, 0.2, 0.3]
        mock.return_value = client_instance
        yield client_instance

@pytest.mark.asyncio
async def test_extract_and_save_questions(db_session, mock_extraction_agent):
    exam_dal = ExamDAL(db_session)
    exam = Exam(user_id="test_user", exam_name="Test Exam")
    await exam_dal.create_exam(exam)

    file_stream = BytesIO(b"1. What is 2+2?")
    await extract_and_save_questions(file_stream, "questions.txt", exam_id=exam.id)

    # Read from real session
    question_dal = QuestionDAL(db_session)
    questions = await question_dal.get_questions(exam.id)
    assert len(questions) == 1
    assert questions[0].text == "What is 2+2?"

@pytest.mark.asyncio
async def test_process_rag_material(db_session, mock_inference_client):
    exam_dal = ExamDAL(db_session)
    exam = Exam(user_id="test_user", exam_name="Test Exam RAG")
    await exam_dal.create_exam(exam)

    file_stream = BytesIO(b"RAG Content")
    await process_rag_material(file_stream, "rag.txt", exam_id=exam.id)

    kb_dal = KnowledgeBaseDAL(db_session)
    knowledge = await kb_dal.get_knowledge(exam.id)
    assert len(knowledge) == 1
    assert knowledge[0].content == "RAG Content"

@pytest.mark.asyncio
async def test_extract_and_save_answers(db_session, mock_extraction_agent):
    from Database.student_dal import StudentDAL
    student_dal = StudentDAL(db_session)
    student = await student_dal.create_student(marks=0)

    exam_dal = ExamDAL(db_session)
    exam = Exam(user_id="test_user", exam_name="Test Exam Answers")
    await exam_dal.create_exam(exam)

    question_dal = QuestionDAL(db_session)
    await question_dal.add_question(Question(
        exam_id=exam.id,
        question_number="1",
        text="What is 2+2?",
        max_marks=5,
        topic="Math",
        question_type="Short"
    ))

    file_stream = BytesIO(b"Answer 1 is 4")
    await extract_and_save_answers([file_stream], ["answers.txt"], user_id=str(student.id), exam_id=exam.id)

    ans_dal = AnswersDAL(db_session)
    answers = await ans_dal.get_answers(exam.id, student.id)
    assert len(answers) == 1
    assert answers[0].answer == "4"

@pytest.mark.asyncio
async def test_extract_and_save_rubric(db_session, mock_extraction_agent):
    exam_dal = ExamDAL(db_session)
    exam = Exam(user_id="test_user", exam_name="Test Exam Rubric")
    await exam_dal.create_exam(exam)

    question_dal = QuestionDAL(db_session)
    q1 = Question(
        exam_id=exam.id,
        question_number="1",
        text="What is 2+2?",
        max_marks=5,
        topic="Math",
        question_type="Short"
    )
    await question_dal.add_question(q1)

    file_stream = BytesIO(b"Rubric for Q1")
    await extract_and_save_rubric(file_stream, "rubric.txt", exam_id=exam.id)

    q_updated = await question_dal.get_question(q1.id, exam.id)
    assert q_updated.rubrics == "Correct Answer: 4"
