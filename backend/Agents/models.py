from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional

class QuestionExtractionModel(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question_id: str = Field(..., description="A unique identifier or sequence number for the question (e.g., 'Q1')")
    question: str = Field(..., description="The full text of the question")
    marks: int = Field(..., description="The number of marks assigned to the question. If not specified, use a reasonable default like 5.")
    topic: str = Field(..., description="The specific topic or concept the question covers")
    question_type: str = Field(..., description="The type/classification of the question")

class AnswerExtractionModel(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question_id: str = Field(..., description="The unique identifier or number of the question this answer belongs to (e.g., 'Q1')")
    answers: str = Field(..., description="The full extracted answer text")

class RubricExtractionModel(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question_id: str = Field(..., description="The unique identifier or number of the question this rubric belongs to (e.g., 'Q1')")
    rubrics: str = Field(..., description="The grading rubric/criteria for the question")

class GradingAgentOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question_id: int = Field(..., description="The sequence number or order of the question")
    marks: int = Field(..., description="The marks awarded to the student for this question")
