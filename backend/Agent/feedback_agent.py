import os
from typing import List, Dict,Any
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from dotenv import load_dotenv

load_dotenv()

# Define the schema for individual question feedback
class QuestionFeedback(BaseModel):
    strengths: List[str] = Field(..., description="Strengths demonstrated in the answer.")
    areas_for_improvement: List[str] = Field(..., description="Areas where the answer could be improved.")

# Define the schema for the overall feedback report
class FeedbackReport(BaseModel):
    overall_suggestions: List[str] = Field(..., description="Suggestions for improvement across the entire exam.")
    question_feedback: List[QuestionFeedback] = Field(..., description="Detailed feedback per question.")

# FeedbackAgent class utilizing PydanticAI with Groq
class FeedbackAgent:
    def __init__(self, model: str = "groq:qwen-qwq-32b"):
        """
        Initialize the agent with the specified Groq model.
        """
        self.agent = Agent(
            model=model,
            result_type=FeedbackReport,
            system_prompt=(
                "You are an educational feedback assistant. "
                "For each exam question, provide the strengths and areas for improvement based on "
                "the student's answer and obtained marks. Additionally, provide overall suggestions "
                "for improvement across the entire exam."
            )
        )

    def generate_feedback(self, individual_marks: List[Dict[str, Any]]) -> dict:
        """
        Generate structured feedback based on individual question performance.
        """
        prompt = "Provide feedback on the following exam performance:\n\n"
        for item in individual_marks:
            question_text = item["question_text"]
            answer_text = item["answer_text"]
            marks_awarded = item["marks_awarded"]
            total_marks_possible = item["total_marks_possible"]
            prompt += (
                f"Question: {question_text}\n"
                f"Marks Awarded: {marks_awarded}/{total_marks_possible}\n"
                f"Answer: {answer_text}\n\n"
            )

        # Run the agent synchronously
        result = self.agent.run_sync(prompt)

        # Return the structured feedback as a dictionary
        return result.data.model_dump()


    def get_overall_suggestions(self, individual_marks: List[Dict[str, Any]]) -> List[str]:
        """
        Generate overall suggestions for the entire exam paper.
        """
        feedback = self.generate_feedback(individual_marks)
        return feedback["overall_suggestions"]

