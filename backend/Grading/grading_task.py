import os
import asyncio
import logging
import requests

from Agents.grading_agent import GradingAgent
from Database import get_answers_dal, get_question_dal, get_student_dal
from Grading.models import GradingInfo
from faststream.redis.fastapi import RedisRouter

logger = logging.getLogger(__name__)

if os.environ.get("REDIS_URL"):
    grading_task_router = RedisRouter(os.environ["REDIS_URL"])
else:
    grading_task_router = RedisRouter("redis://localhost:6379")

@grading_task_router.subscriber("grading_task_queue")
async def grading_task(grading_info: GradingInfo):
    exam_id = grading_info.exam_id
    student_ids = grading_info.student_ids
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    webhook_url = f"{frontend_url}/api/webhook/results"
    question_dal = await get_question_dal()
    answers_dal = await get_answers_dal()
    student_dal = await get_student_dal()

    questions = await question_dal.get_questions(exam_id)
    question_map = {q.id: q for q in questions}

    agent = GradingAgent(api_key=os.environ.get("GROQ_API_KEY"), exam_id=exam_id)

    for student_id in student_ids:
        answers = await answers_dal.get_answers(exam_id, student_id)
        answers_to_update = []
        total_marks = 0

        for ans in answers:
            q = question_map.get(ans.question_id)
            if not q:
                continue

            query = (
                f"Question: {q.text}\n"
                f"Topic: {q.topic}\n"
                f"Type: {q.question_type}\n"
                f"Rubrics: {q.rubrics}\n\n"
                f"Student Answer: {ans.answer}"
            )

            grade_output = await agent.grade(query=query, max_marks=q.max_marks)

            if grade_output is not None:
                ans.marks = grade_output.marks
                total_marks += grade_output.marks
                answers_to_update.append(ans)

        if answers_to_update:
            await answers_dal.update_answers(answers_to_update)
            await student_dal.update_student(student_id=student_id, marks=total_marks)

        payload = {
            "exam_id": str(exam_id),
            "student_id": str(student_id),
            "message": f"Job has been finished for student {student_id} and exam {exam_id}"
        }

        try:
            await asyncio.to_thread(requests.post, webhook_url, json=payload, timeout=10)
            logger.info(f"Successfully submitted grading result for student {student_id} to {webhook_url}")
        except Exception as e:
            logger.error(f"Failed to submit result for student {student_id} to webhook: {e}")
