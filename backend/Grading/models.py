from pydantic import BaseModel
import uuid
from pydantic.fields import Field

class GradingInfo(BaseModel):
    exam_id: uuid.UUID
    student_ids: list[uuid.UUID]
    priority: int = Field(default=0)
