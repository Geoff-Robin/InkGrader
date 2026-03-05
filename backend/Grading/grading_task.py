import os
import asyncio
import logging
import requests

from Agents.grading_agent import GradingAgent
from Database.config import async_session
from Database.questions_dal import QuestionDAL
from Database.answers_dal import AnswersDAL
from Database.student_dal import StudentDAL
from Grading.models import GradingInfo
from faststream.redis.fastapi import RedisRouter

logger = logging.getLogger(__name__)

if os.environ.get("REDIS_URL"):
    grading_task_router = RedisRouter(os.environ["REDIS_URL"])
else:
    grading_task_router = RedisRouter("redis://localhost:6379")

@grading_task_router.subscriber(list="grading_task_queue")
async def grading_task(grading_info: GradingInfo):
    exam_id = grading_info.exam_id
    student_ids = grading_info.student_ids
    logger.info(f"Started grading task for exam_id: {exam_id} with {len(student_ids)} students.")
    frontend_url = os.environ.get("FRONTEND_URL", "http://host.docker.internal:3000")
    webhook_url = f"{frontend_url}/api/webhook/results"
    async with async_session() as session:
        question_dal = QuestionDAL(session)
        answers_dal = AnswersDAL(session)
        student_dal = StudentDAL(session)

        questions = await question_dal.get_questions(exam_id)
        question_map = {q.id: q for q in questions}

        agent = GradingAgent(api_key=os.environ.get("GROQ_API_KEY"), exam_id=exam_id)

        for student_id in student_ids:
            logger.info(f"Processing student: {student_id}")
            answers = await answers_dal.get_answers(exam_id, student_id)
            answers_to_update = []
            total_marks = 0

            logger.info(f"Found {len(answers)} answers to grade for student {student_id}.")

            tasks = []
            valid_answers = []

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

                tasks.append(agent.grade(query=query, max_marks=q.max_marks))
                valid_answers.append(ans)

            results = await asyncio.gather(*tasks, return_exceptions=True)

            for ans, grade_output in zip(valid_answers, results):
                if isinstance(grade_output, Exception):
                    logger.error(f"Error grading answer {ans.id}: {grade_output}")
                    continue

                if grade_output is not None:
                    ans.marks = grade_output.marks
                    total_marks += grade_output.marks
                    answers_to_update.append(ans)

            if answers_to_update:
                await answers_dal.update_answers(answers_to_update)
                await student_dal.update_student(student_id=student_id, marks=total_marks)
                logger.info(f"Completed grading for student {student_id}. Total Marks: {total_marks}")
            else:
                logger.warning(f"No valid answers graded for student {student_id}.")

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
