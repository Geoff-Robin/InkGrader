import os
import json
import uuid
import logging
from typing import Optional

from groq import AsyncGroq
from pydantic import ValidationError

from Agents.prompts import GRADING_AGENT_PROMPT
from Agents.models import GradingAgentOutput
from Agents.tools import rag_tool

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GradingAgent:
    def __init__(self, api_key: Optional[str], exam_id: uuid.UUID):
        if not api_key and not os.environ.get("GROQ_API_KEY"):
            raise ValueError(
                "GROQ_API_KEY environment variable or api_key argument must be provided"
            )

        self.api_key = api_key or os.environ["GROQ_API_KEY"]
        self.groq = AsyncGroq(api_key=self.api_key)
        self.exam_id = exam_id

    async def grade(self, query: str, max_marks: int) -> Optional[GradingAgentOutput]:
        try:
            user_content = query
            try:
                reference_context = await rag_tool(query, self.exam_id)
                if reference_context:
                    user_content = (
                        f"{query}\n\n"
                        "Retrieved reference context:\n"
                        "<reference_context>\n"
                        f"{reference_context}\n"
                        "</reference_context>"
                    )
            except Exception:
                # A missing reference or temporary embedding failure should not
                # prevent rubric-based grading from completing.
                logger.warning(
                    "RAG retrieval failed for exam %s; grading without reference context",
                    self.exam_id,
                    exc_info=True,
                )

            response = await self.groq.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                    {
                        "role": "system",
                        "content": GRADING_AGENT_PROMPT.format(max_marks=max_marks),
                    },
                    {
                        "role": "user",
                        "content": user_content,
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
