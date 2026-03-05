from fastapi import (
    APIRouter,
    Request,
    BackgroundTasks
)
import base64
from Database.config import async_session
from Database.student_dal import StudentDAL
from Grading import grading_task_router, GradingInfo
from FileProcessor.utils import extract_and_save_questions, extract_and_save_answers, extract_and_save_rubric, process_rag_material
from fastapi.exceptions import HTTPException
from uuid import UUID
from Database.exam_dal import ExamDAL
from Database.questions_dal import QuestionDAL
from Database.answers_dal import AnswersDAL
from Database.knowledge_base_dal import KnowledgeBaseDAL
from Database.models import Exam
from io import BytesIO
from typing import Optional

exam_router = APIRouter()

@exam_router.get("/")
async def get_exams(
    request: Request,
):
    try:
        user_id = request.headers.get("X-User-Id")
        if not user_id:
            raise HTTPException(status_code=400, detail="X-User-Id header not provided")
        async with async_session() as session:
            exam_dal = ExamDAL(session)
            exams = await exam_dal.get_exams(user_id)
        return exams
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@exam_router.post("/")
async def create_exam_form(
    request: Request,
):
    try:
        user_id = request.headers.get("X-User-Id")
        if not user_id:
            raise HTTPException(status_code=400, detail="X-User-Id header not provided")
            
        req_json = await request.json()
        exam_name = req_json.get("exam_name")
        if not exam_name:
            raise HTTPException(status_code=400, detail="exam_name not provided")

        questions_file_b64 = req_json.get("questions_file_base_64")
        questions_filename = req_json.get("questions_filename")
        if not questions_file_b64 or not questions_filename:
            raise HTTPException(status_code=400, detail="Questions file not provided")

        rubrics_file_b64 = req_json.get("rubrics_file_base_64")
        rubrics_filename = req_json.get("rubrics_filename")
        if not rubrics_file_b64 or not rubrics_filename:
            raise HTTPException(status_code=400, detail="Rubrics file not provided")

        # Optional reference file
        reference_file_b64 = req_json.get("reference_file_base_64")
        reference_filename = req_json.get("reference_filename")

        import uuid
        new_exam_id = uuid.uuid4()
        
        async with async_session() as session:
            exam_dal = ExamDAL(session)
            exam = Exam(id=new_exam_id, user_id=user_id, exam_name=exam_name)
            await exam_dal.create_exam(exam)

        # Process Questions
        questions_stream = BytesIO(base64.b64decode(questions_file_b64))
        await extract_and_save_questions(file_stream=questions_stream, filename=questions_filename, exam_id=new_exam_id)

        # Process Rubrics
        rubrics_stream = BytesIO(base64.b64decode(rubrics_file_b64))
        await extract_and_save_rubric(file_stream=rubrics_stream, filename=rubrics_filename, exam_id=new_exam_id, user_id=user_id)

        # Process Reference (Optional)
        if reference_file_b64 and reference_filename:
            reference_stream = BytesIO(base64.b64decode(reference_file_b64))
            await process_rag_material(file_stream=reference_stream, filename=reference_filename, exam_id=new_exam_id)

        return {"message": "Exam and materials created successfully", "exam_id": str(new_exam_id)}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@exam_router.post("/{exam_id}/answers")
async def submit_answers(request: Request, background_tasks: BackgroundTasks):
    try:
        body = await request.json()
        exam_id = UUID(request.path_params.get("exam_id"))
        filenames = body.get("filenames")
        files_base_64 = body.get("files_base_64")

        if not files_base_64 or not filenames or len(filenames) != len(files_base_64):
            raise HTTPException(status_code=400, detail="Invalid files payload")

        student_ids = []
        extraction_tasks = []

        async with async_session() as session:
            student_dal = StudentDAL(session)
            for i in range(len(files_base_64)):
                file_b64_bytes = base64.b64decode(files_base_64[i])
                file_stream = BytesIO(file_b64_bytes)

                student = await student_dal.create_student(exam_id=exam_id, marks=None)
                student_ids.append(student.id)

                extraction_tasks.append(
                    extract_and_save_answers(file_streams=[file_stream], filenames=[filenames[i]], exam_id=exam_id, user_id=student.id)
                )

        async def process_answers_in_bg():
            import asyncio
            await asyncio.gather(*extraction_tasks)
            grading_info = GradingInfo(exam_id=exam_id, student_ids=student_ids, priority=0)
            await grading_task_router.broker.publish(grading_info, list="grading_task_queue")

        background_tasks.add_task(process_answers_in_bg)

        # Return stringified student IDs immediately
        return {"message": "Answers submitted successfully. Extraction and grading started.", "student_ids": [str(sid) for sid in student_ids]}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@exam_router.post("/{exam_id}/reference")
async def post_reference(request: Request, background_tasks: BackgroundTasks):
    try:
        exam_id = UUID(request.path_params.get("exam_id"))
        body = await request.json()
        reference_file_base_64 = body.get("reference_file_base_64")
        reference_filename = body.get("reference_filename")
        reference_file_stream = BytesIO(base64.b64decode(reference_file_base_64))
        background_tasks.add_task(process_rag_material, file_stream=reference_file_stream, filename=reference_filename, exam_id=exam_id)
        return {"message": "Reference submitted successfully. Processing in background."}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@exam_router.get("/{exam_id}/students")
async def get_students(request: Request, graded: Optional[bool] = None):
    try:
        exam_id = UUID(request.path_params.get("exam_id"))
        async with async_session() as session:
            students_dal = StudentDAL(session)
            students = await students_dal.get_students(exam_id=exam_id)
        if graded is None:
            return students
        graded_students = []
        ungraded_students = []
        for student in students:
            if student.marks is None:
                ungraded_students.append(student)
            else:
                graded_students.append(student)
        if graded:
            return graded_students
        else:
            return ungraded_students
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@exam_router.get("/{exam_id}/students/{student_id}")
async def get_test_results(request: Request):
    try:
        exam_id = UUID(request.path_params.get("exam_id"))
        student_id = UUID(request.path_params.get("student_id"))
        
        async with async_session() as session:
            student_dal = StudentDAL(session)
            student = await student_dal.get_student(student_id=student_id)

            if not student:
                raise HTTPException(status_code=404, detail="Student not found")

            answers_dal = AnswersDAL(session)
            answers = await answers_dal.get_answers(exam_id=exam_id, student_id=student_id)

            question_dal = QuestionDAL(session)
            questions = await question_dal.get_questions(exam_id=exam_id)
            question_map = {q.id: q for q in questions}

            results = []
            for ans in answers:
                q = question_map.get(ans.question_id)
                if q:
                    results.append({
                        "question_id": str(q.id),
                        "question_number": q.question_number,
                        "question_text": q.text,
                        "topic": q.topic,
                        "max_marks": q.max_marks,
                        "student_answer": ans.answer,
                        "awarded_marks": ans.marks
                    })

        return {
            "student_id": str(student.id),
            "total_marks": student.marks,
            "results": results
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
