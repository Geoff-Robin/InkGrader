from fastapi import (
    APIRouter,
    Request,
    Response,
    Depends,
    WebSocket,
    WebSocketDisconnect,
    BackgroundTasks
)
from redis_pubsub import PubSubManager
import asyncio
from models import *
from Auth.utils import get_current_user
from Auth.utils import ALGORITHM, JWT_SECRET_KEY
from jwt import decode as jwt_decode, PyJWTError
from config import ConnectionManager, running_tasks, task_lock
from bson import ObjectId
from grading_task import grading_task

exam_router = APIRouter()
conn_manager = ConnectionManager()


@exam_router.post("/form")
async def create_exam_form(
    background_tasks: BackgroundTasks,
    request: Request,
    response: Response,
    user=Depends(get_current_user),
    form: CreateExamForm = Depends(),
):
    questions_cursor = await request.app.database["Questions"].find_one({"user_id": user["_id"], "exam_name": form.exam_name})
    if questions_cursor:
        return{
            "message": "Exam form already exists",
        }
    question_info = QuestionInfo(
        file_name=form.questions.filename,
        questions=BytesIO(await form.questions.read())
    )
    answers_info=[]
    for student_answers in form.student_answers:
        answers_info.append(AnswerInfo(
            file_name=student_answers.filename,
            student_answers=BytesIO(await student_answers.read())
        ))
    rag_file_info = RagFileInfo(
        file_name=form.rag_material.filename,
        rag_material=BytesIO(await form.rag_material.read())
    )

    task_key = f"{user['_id']}:{form.exam_name}"
    grading_task_args= GradingTaskArgs(
        question_info=question_info,
        answers_info=answers_info,
        rag_file_info=rag_file_info,
        user_id=ObjectId(user["_id"]),
        db=request.app.database,
        exam_name=form.exam_name
    )
    background_tasks.add_task(grading_task, grading_task_args=grading_task_args)
    response.status_code = 201
    return {"message": "Exam created successfully"}


@exam_router.websocket_route("/{exam_id}")
async def exam_socket(websocket: WebSocket):
    await websocket.accept()
    exam_id = websocket.path_params.get("exam_id")
    if not exam_id:
        await websocket.close(code=1008, reason="Invalid exam ID")
        return
    pubsub = PubSubManager()
    await pubsub.connect()
    token = websocket.headers.get("Authorization", "").split(" ")[-1]
    try:
        subject = jwt_decode(token, key=JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = subject.get("sub")
        if not user_id:
            raise ValueError("Missing sub")
    except (PyJWTError, ValueError):
        await websocket.close(code=1008, reason="Invalid token")
        return
    grading_process_key = f"{user_id}:{exam_id}"
    redis_pubsub = await pubsub.subscribe(grading_process_key)
    await conn_manager.connect(websocket, user_id)

    try:
        while True:
            async for message in redis_pubsub.listen():
                if message["type"] == "message":

                    answers_info_list = websocket.app.database["Answers"].find(
                        {
                            "user_id": ObjectId(user_id),
                            "exam_id": ObjectId(exam_id),
                        }
                    )
                    answers_info_list = await answers_info_list.to_list(length=None)
                    if not answers_info_list:
                        await conn_manager.send_personal_message(
                            {"message": "No answers found for grading"}, user_id
                        )
                        continue
                    data = []
                    for answer_info in answers_info_list:
                        total_marks = sum(
                            answer["marks"]
                            for answer in answer_info.get("answers", [])
                            if "marks" in answer
                        )
                        data.append(
                            {
                                "file_name": answer_info["file_name"],
                                "total_marks": total_marks,
                            }
                        )
                    await conn_manager.send_personal_message({"message": data}, user_id)
    except WebSocketDisconnect:
        await conn_manager.disconnect(user_id)
        await pubsub.close()
    except asyncio.CancelledError:
        await pubsub.close()
        await websocket.close(code=1000, reason="WebSocket connection cancelled")
        print(f"WebSocket connection for user {user_id} cancelled.")
    finally:
        await pubsub.close()
        print(f"WebSocket connection for user {user_id} closed.")
        
@exam_router.get("/")
async def get_exam_list(
    request: Request,
    user=Depends(get_current_user),
):
    exams = await request.app.database["Questions"].find(
        {"user_id": ObjectId(user["_id"])}
    ).to_list(length=None)
    returned_exams = []
    for exam in exams:
        e = {
            "id": str(exam["_id"]),
            "exam_name": exam["exam_name"],
        }
        returned_exams.append(e)
    return {"exams": returned_exams}