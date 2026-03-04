from FileProcessor import FileContentType
from pypdf._page import PageObject
import base64
from Agents.models import QuestionExtractionModel, AnswerExtractionModel, RubricExtractionModel
from typing import List
from uuid import UUID
from Database import get_question_dal, Question, get_answers_dal, Answers

async def save_questions_in_db(questions: List[QuestionExtractionModel], **kwargs):

    questions_dict_list = [question.model_dump() for question in questions]
    question_dal = await get_question_dal()
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
    answer_dal = await get_answers_dal()
    answer_list = []
    for answer in answer_dict_list:
        answer_row = Answers(
            exam_id=kwargs["exam_id"],
            question_number=answer["question_id"],
            answer=answer["answers"],
            marks=None,
        )
        answer_list.append(answer_row)
    await answer_dal.add_answers(answer_list)

async def save_rubrics_in_db(rubrics: List[RubricExtractionModel], **kwargs):
    rubric_dict_list = [rubric.model_dump() for rubric in rubrics]
    answer_dal = await get_answers_dal()
    answers_list = await answer_dal.get_answers(kwargs["exam_id"], kwargs["user_id"])
    mp = {answer.id: answer for answer in answers_list}
    for rubric in rubric_dict_list:
        if rubric["question_id"] in mp:
            mp[rubric["question_id"]].rubrics = rubric["rubrics"]
    await answer_dal.update_answers(mp.values())

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
