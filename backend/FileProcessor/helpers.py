from FileProcessor import FileContentType
from pypdf._page import PageObject
import base64
from Agents.models import QuestionExtractionModel, AnswerExtractionModel, RubricExtractionModel
from typing import List
from uuid import UUID
from Database.config import async_session
from Database.questions_dal import QuestionDAL
from Database.models import Question, Answers
from Database.answers_dal import AnswersDAL

async def save_questions_in_db(questions: List[QuestionExtractionModel], **kwargs):

    questions_dict_list = [question.model_dump() for question in questions]
    async with async_session() as session:
        question_dal = QuestionDAL(session)
        question_list = []
        for question in questions_dict_list:
            question_row = Question(
                exam_id=kwargs["exam_id"],
                question_number=question["question_id"],
                text=question["question"],
                max_marks=question["marks"],
                topic=question["topic"],
                question_type=question["question_type"],
            )
            question_list.append(question_row)
        await question_dal.add_questions(question_list)

async def save_answers_in_db(answers: List[AnswerExtractionModel],**kwargs):
    answer_dict_list = [answer.model_dump() for answer in answers]
    async with async_session() as session:
        question_dal = QuestionDAL(session)
        questions = await question_dal.get_questions(kwargs["exam_id"])
        question_map = {q.question_number: q.id for q in questions}

        answer_dal = AnswersDAL(session)
        answer_list = []
        for answer in answer_dict_list:
            question_id = question_map.get(answer["question_id"])
            if question_id:
                answer_row = Answers(
                    exam_id=kwargs["exam_id"],
                    student_id=kwargs["user_id"],
                    question_id=question_id,
                    answer=answer["answers"],
                    marks=None,
                )
                answer_list.append(answer_row)
        await answer_dal.add_answers(answer_list)

async def save_rubrics_in_db(rubrics: List[RubricExtractionModel], **kwargs):
    rubric_dict_list = [rubric.model_dump() for rubric in rubrics]
    async with async_session() as session:
        question_dal = QuestionDAL(session)
        questions_list = await question_dal.get_questions(kwargs["exam_id"])
        mp = {question.question_number: question for question in questions_list}
        for rubric in rubric_dict_list:
            if rubric["question_id"] in mp:
                mp[rubric["question_id"]].rubrics = rubric["rubrics"]
        await question_dal.update_questions(list(mp.values()))

def file_type(page: PageObject) -> FileContentType:
    text = page.extract_text()
    has_text = bool(text and text.strip())

    resources = page.get("/Resources")
    has_images = False
    if resources and "/XObject" in resources:
        xobject = resources["/XObject"]
        if isinstance(xobject, dict):
            for obj in xobject.values():
                if obj.get("/Subtype") == "/Image":
                    has_images = True
                    break

    if has_images and has_text:
        return FileContentType.IMG_OR_TEXT
    elif has_text:
        return FileContentType.TEXT
    elif has_images:
        return FileContentType.IMG
    else:
        return FileContentType.UNKNOWN

def extract_image_base64(page):

    xobjects = page["/Resources"]["/XObject"]

    for name in xobjects:
        xobj = xobjects[name].get_object()
        if xobj["/Subtype"] == "/Image":
            image_data = xobj.get_data()
            base64_str = base64.b64encode(image_data).decode("utf-8")
            return base64_str

    raise ValueError("No image found on the page.")
