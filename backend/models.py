from fastapi import File, UploadFile,Form
from typing import List,Annotated
from dataclasses import dataclass
from bson import ObjectId
from pymongo.database import Database
from io import BytesIO
class CreateExamForm:
    def __init__(
        self,
        exam_name: Annotated[str,Form(...)],
        questions: Annotated[UploadFile,File(...)],
        student_answers: Annotated[List[UploadFile],File(...)],
        rag_material: Annotated[UploadFile,File(...)]
    ):
        self.exam_name = exam_name
        self.questions = questions
        self.student_answers = student_answers
        self.rag_material = rag_material

@dataclass
class QuestionInfo:
    file_name: str
    questions: BytesIO

@dataclass
class AnswerInfo:
    file_name: str
    student_answers: List[BytesIO]

@dataclass
class RagFileInfo:
    file_name: str
    rag_material: BytesIO

@dataclass
class GradingTaskArgs:
    question_info: QuestionInfo
    answers_info: List[AnswerInfo]
    rag_file_info: RagFileInfo
    db: Database
    user_id: ObjectId
    exam_name: str