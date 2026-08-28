import json
from typing import List
from pydantic import TypeAdapter
import os
from Agents.models import QuestionExtractionModel, AnswerExtractionModel, RubricExtractionModel
from Agents.prompts import QUESTION_EXTRACTION_PROMPT, ANSWER_EXTRACTION_PROMPT, RUBRICS_EXTRACTION_PROMPT
from groq import AsyncGroq


class ExtractionAgent:
    def __init__(self, api_key=None):
        if api_key or os.environ.get("GROQ_API_KEY"):
            api_key = os.environ["GROQ_API_KEY"] or api_key
        else:
            raise ValueError("Environment variable GROQ_API_KEY or api_key argument must be provided")
        self.client = AsyncGroq(api_key=api_key)

    async def extract_questions(self, questions_text: str) -> List[QuestionExtractionModel]:
        schema = QuestionExtractionModel.model_json_schema()

        response = await self.client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {"role": "system", "content": QUESTION_EXTRACTION_PROMPT},
                {"role": "user", "content": questions_text},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "question_list",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "items": {
                                "type": "array",
                                "items": schema
                            }
                        },
                        "required": ["items"],
                        "additionalProperties": False
                    }
                }
            }
        )
        if response and response.choices and response.choices[0].message.content:
            data = json.loads(response.choices[0].message.content)
        else:
            return []
        return TypeAdapter(List[QuestionExtractionModel]).validate_python(data["items"])

    async def extract_answers(self, answers_text: str) -> List[AnswerExtractionModel]:
        schema = AnswerExtractionModel.model_json_schema()

        response = await self.client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {"role": "system", "content": ANSWER_EXTRACTION_PROMPT},
                {"role": "user", "content": answers_text},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "answer_list",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "items": {
                                "type": "array",
                                "items": schema
                            }
                        },
                        "required": ["items"],
                        "additionalProperties": False
                    }
                }
            }
        )
        if response and response.choices and response.choices[0].message.content:
            data = json.loads(response.choices[0].message.content)
            return TypeAdapter(List[AnswerExtractionModel]).validate_python(data["items"])
        else:
            return []

    async def extract_rubrics(self, rubrics_text: str) -> List[RubricExtractionModel]:
        schema = RubricExtractionModel.model_json_schema()

        response = await self.client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {"role": "system", "content": RUBRICS_EXTRACTION_PROMPT},
                {"role": "user", "content": rubrics_text},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "rubric_list",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "items": {
                                "type": "array",
                                "items": schema
                            }
                        },
                        "required": ["items"],
                        "additionalProperties": False
                    }
                }
            }
        )
        if response and response.choices and response.choices[0].message.content:
            data = json.loads(response.choices[0].message.content)
            return TypeAdapter(List[RubricExtractionModel]).validate_python(data["items"])
        else:
            return []
