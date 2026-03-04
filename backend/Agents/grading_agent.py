import os
import json
import uuid
import logging
import asyncio
from typing import Optional

from groq import Groq
from pydantic import BaseModel, Field, ValidationError

from Agents.prompts import GRADING_AGENT_PROMPT


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GradingAgentOutput(BaseModel):
    question_id: int = Field(...)
    marks: int = Field(...)


class GradingAgent:
    def __init__(self, api_key: Optional[str], exam_id: uuid.UUID):
        if not api_key and not os.environ.get("GROQ_API_KEY"):
            raise ValueError(
                "GROQ_API_KEY environment variable or api_key argument must be provided"
            )

        self.api_key = api_key or os.environ["GROQ_API_KEY"]
        self.groq = Groq(api_key=self.api_key)
        self.exam_id = exam_id

    async def grade(self, query: str) -> Optional[GradingAgentOutput]:
        try:
            response = await asyncio.to_thread(
                self.groq.chat.completions.create,
                model="openai/gpt-oss-120b",
                messages=[
                    {
                        "role": "user",
                        "content": GRADING_AGENT_PROMPT.format(query=query),
                    }
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "grading_output",
                        "schema": GradingAgentOutput.model_json_schema(),
                        "strict": True,
                    },
                },
            )

            if not response.choices:
                return None

            content = response.choices[0].message.content
            if not content:
                return None

            parsed = json.loads(content)
            return GradingAgentOutput(**parsed)

        except (json.JSONDecodeError, ValidationError, Exception):
            logger.exception("Grading failed")
            return None
