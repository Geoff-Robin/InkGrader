from bson import ObjectId
from Agents.grading_agent import GradingAgent
from FileProcessor.utils import (
    extract_and_save_answers,
    extract_and_save_questions,
    process_rag_material,
)
from models import GradingTaskArgs
from redis_stream import StreamManager
import traceback
from config import task_lock, running_tasks


async def grading_task(grading_task_args: GradingTaskArgs):
    args = grading_task_args
    db = args.db
    user_id = args.user_id
    exam_name = args.exam_name
    stream_manager = StreamManager()
    exam_id = None

    try:
        await extract_and_save_questions(
            db=db, question_info=args.question_info, user_id=user_id, exam_name=exam_name
        )
    except Exception as e:
        print(f"Error occurred while extracting and saving questions: {e}")
        print(traceback.format_exc())
        return

    try:
        for answer_info in args.answers_info:
            await extract_and_save_answers(
                db=db,
                exam_name=exam_name,
                user_id=user_id,
                answer_info=answer_info,
            )
    except Exception as e:
        print(f"Error occurred while extracting and saving answers: {e}")
        print(traceback.format_exc())
        return

    try:
        await process_rag_material(db=db, rag_file_info=args.rag_file_info, user_id=user_id, exam_name=exam_name)
    except Exception as e:
        print(f"Error occurred while processing RAG material: {e}")
        print(traceback.format_exc())
        return

    try:
        find_result = await db["Questions"].find_one(
            {"exam_name": exam_name, "user_id": user_id}
        )
        exam_id = str(find_result["_id"])
        questions_list = await db["Questions"].find_one(
            {"user_id": user_id, "_id": ObjectId(exam_id)}
        )
        answer_paper_list = db["Answers"].find(
            {"user_id": user_id, "exam_id": ObjectId(exam_id)}
        )
        answer_paper_list = await answer_paper_list.to_list(length=None)

        await stream_manager.connect()
        print("Starting grading task")

        for answer_paper in answer_paper_list:
            for question_info in questions_list["questions"]:
                qa = ""
                qa += f"{question_info['question_id']}. {question_info['question']}\n"
                qa += f"Question Topic: {question_info['topic']}\n"
                qa += f"Question Type: {question_info['question_type']}\n"
                qa += f"Total Marks: {question_info['marks']}\n"
                qa += f"Answer: {answer_paper['answers'][0]['answers']}\n"

                agent = GradingAgent(exam_id=exam_id, user_id=str(user_id), db=db)
                result = await agent.grade(qa)
                print(f"Grading result for question {question_info['question_id']}: {result}")

                marks = result.marks
                await db["Answers"].update_one(
                    {"_id": answer_paper["_id"]},
                    {"$set": {"answers.$[elem].marks": marks}},
                    array_filters=[{"elem.question_id": result.question_id}],
                )
                print(f"Updated marks for question {question_info['question_id']}: {marks}")
            await stream_manager.add_message(
                f"{grading_task_args.user_id}:{exam_id}",
                {"message": f"Grading completed for {answer_paper['_id']}", "exam_id": exam_id,"answer_id": answer_paper["_id"]},
            )

    except Exception as e:
        print(f"Error in grading task: {e}")

    finally:
        await stream_manager.close()
        if exam_id:
            async with task_lock:
                task_key = f"{grading_task_args.user_id}:{exam_id}"
                if task_key in running_tasks:
                    running_tasks.pop(task_key, None)
