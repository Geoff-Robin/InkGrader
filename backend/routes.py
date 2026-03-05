from fastapi import (
    APIRouter,
    Request,
)
import base64
from Database.student_dal import get_student_dal
from Grading import grading_task_router, GradingInfo
from FileProcessor.utils import extract_and_save_questions, extract_and_save_answers, extract_and_save_rubric, process_rag_material
from fastapi.exceptions import HTTPException
from uuid import UUID
from Database import get_exam_dal, Exam, get_question_dal, get_answers_dal
from io import BytesIO
from typing import Optional

exam_router = APIRouter()

@exam_router.get("/")
async def get_exams(
    request: Request,
):
    try:
        user_id = request.headers.get("X-User-Id")
        exam_dal = await get_exam_dal()
        if(user_id):
            exams = await exam_dal.get_exams(user_id)
        else:
            raise HTTPException(status_code=400, detail="X-User-Id header not provided")
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
        req_json = await request.json()
        exam = Exam(**req_json)
        exam_dal = await get_exam_dal()
        await exam_dal.create_exam(exam)
        return {"message": "Exam created successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@exam_router.post("/{exam_id}/questions")
async def submit_paper(request: Request):
    try:
        body = await request.json()
        exam_id = request.path_params.get("exam_id")
        file_base_64 = body.get("file_base_64");
        filename = body.get("filename");
        file_b64_bytes = base64.b64decode(file_base_64)
        file_stream = BytesIO(file_b64_bytes)
        await extract_and_save_questions(file_stream = file_stream, filename = filename, exam_id = exam_id)
        return {"message": "Exam questions"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@exam_router.post("/{exam_id}/answers")
async def submit_answers(request: Request):
    try:
        body = await request.json()
        exam_id = UUID(request.path_params.get("exam_id"))
        filenames = body.get("filenames")
        files_base_64 = body.get("files_base_64")

        if not files_base_64 or not filenames or len(filenames) != len(files_base_64):
            raise HTTPException(status_code=400, detail="Invalid files payload")

        student_dal = await get_student_dal()
        student_ids = []

        for i in range(len(files_base_64)):
            file_b64_bytes = base64.b64decode(files_base_64[i])
            file_stream = BytesIO(file_b64_bytes)

            student = await student_dal.create_student(exam_id=exam_id, marks=None)
            student_ids.append(student.id)

            await extract_and_save_answers(file_streams=[file_stream], filenames=[filenames[i]], exam_id=exam_id, user_id=student.id)

        grading_info = GradingInfo(exam_id=exam_id, student_ids=student_ids, priority=0)
        await grading_task_router.broker.publish(grading_info)

        # Return stringified student IDs
        return {"message": "Answers submitted successfully", "student_ids": [str(sid) for sid in student_ids]}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@exam_router.post("/{exam_id}/rubrics")
async def submit_rubrics(request: Request):
    try:
        body = await request.json()
        user_id = request.headers.get("X-User-Id")
        exam_id = request.path_params.get("exam_id")
        rubric_file_base_64 = body.get("rubric_file_base_64")
        filename = body.get("filename")
        rubric_file_stream = BytesIO(base64.b64decode(rubric_file_base_64))
        await extract_and_save_rubric(file_stream=rubric_file_stream, filename=filename, exam_id=exam_id, user_id=user_id)
        return {"message": "Rubric submitted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@exam_router.post("/{exam_id}/reference")
async def post_reference(request: Request):
    try:
        exam_id = request.path_params.get("exam_id")
        body = await request.json()
        reference_file_base_64 = body.get("reference_file_base_64")
        reference_filename = body.get("reference_filename")
        reference_file_stream = BytesIO(base64.b64decode(reference_file_base_64))
        await process_rag_material(file_stream=reference_file_stream, filename=reference_filename, exam_id=exam_id)
        return {"message": "Reference submitted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@exam_router.get("/{exam_id}/students")
async def get_students(request: Request, graded: Optional[bool] = None):
    try:
        exam_id = request.path_params.get("exam_id")
        students_dal = await get_student_dal()
        students = await students_dal.get_students(exam_id=UUID(exam_id))
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
        exam_id = request.path_params.get("exam_id")
        student_id = request.path_params.get("student_id")
        student_dal = await get_student_dal()
        student = await student_dal.get_student(student_id=UUID(student_id))

        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        answers_dal = await get_answers_dal()
        answers = await answers_dal.get_answers(exam_id=UUID(exam_id), student_id=UUID(student_id))

        question_dal = await get_question_dal()
        questions = await question_dal.get_questions(exam_id=UUID(exam_id))
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
