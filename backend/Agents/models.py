from pydantic import BaseModel, Field, field_validator
from typing import Optional

class QuestionExtractionModel(BaseModel):
    question_id: str = Field(...,description="id that reprsents the question order")
    question: str
    marks: int = Field(default=5)
    topic: Optional[str]
    question_type: str

    @field_validator("marks",mode="before")
    @classmethod
    def default_marks(cls, value, info):
        return value if value is not None else cls.model_fields["marks"].get_default()

class AnswerExtractionModel(BaseModel):
    question_id: str = Field(...,description="id that represents the question order")
    answers: str = Field(...,description="the answer to the question")

class RubricExtractionModel(BaseModel):
    question_id: str = Field(...,description="id that represents the question order")
    rubrics: str = Field(...,description="the number of marks assigned to the question")

class GradingAgentOutput(BaseModel):
    question_id:int = Field(...,description="id that reprsents the question order")
    marks: int
