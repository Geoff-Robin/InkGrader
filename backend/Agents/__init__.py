from pymongo.database import Database
from bson import ObjectId
from Agents.grading_agent import GradingAgent
from redis_pubsub import PubSubManager
import json
from config import task_lock, running_tasks



async def grading_task(db: Database, exam_id: str, user_id: ObjectId):
    try:
        questions_list = await db["Questions"].find_one(
            {"user_id": user_id, "_id": ObjectId(exam_id)}
        )
        answer_paper_list = db["Answers"].find(
            {"user_id": user_id, "exam_id": ObjectId(exam_id)}
        )
        answer_paper_list = await answer_paper_list.to_list(length=None)
        pubsub = PubSubManager()
        await pubsub.connect()
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
                print(
                    f"Grading result for question {question_info['question_id']}: {result}"
                )
                marks = result.marks
                await db["Answers"].update_one(
                    {"_id": answer_paper["_id"]},
                    {"$set": {"answers.$[elem].marks": marks}},
                    array_filters=[{"elem.question_id": result.question_id}],
                )
                print(f"Updated marks for question {question_info['question_id']}: {marks}")
            await pubsub.publish(
                f"{user_id}:{exam_id}",
                json.dumps({"message": "Grading completed", "exam_id": exam_id}),
            )
    except Exception as e:
        print(f"Error in grading task: {e}")
    
    finally:
        await pubsub.close()
        async with task_lock:
            task_key = f"{user_id}:{exam_id}"
            if task_key in running_tasks:
                running_tasks.pop(task_key, None)