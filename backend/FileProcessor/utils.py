"""
Utility functions for processing exam files, extracting questions and answers,
and handling RAG material indexing for the AutoCorrector backend.

Includes PDF and text file handling, OCR integration, and database operations.
"""

import os
from FileProcessor import OcrAPI, FileContentType, Engine
from pypdf import PdfReader
from io import BytesIO
from Agents.extraction_agent import ExtractionAgent
from pypdf import PdfReader
from io import BytesIO
from Database import get_question_dal
from FileProcessor.helpers import *


async def extract_and_save_questions(
    file_stream: BytesIO, filename: str, **kwargs
):
    """
    Extracts questions from the uploaded exam file (PDF or TXT), processes them,
    and saves the extracted questions to the database.

    Args:
        question_info (QuestionInfo): Contains question filename and question file bytes
        **kwargs: Contains user_id (ObjectId) and exam_name (str)

    Returns:
        None
    """
    questions = ""
    if filename.endswith(".txt"):
        questions = file_stream.read().decode("utf-8")
        extraction_agent = ExtractionAgent()
        extracted_questions = await extraction_agent.extract_questions(questions)
    elif filename.endswith(".pdf"):
        reader = PdfReader(file_stream)
        for page in reader.pages:
            if file_type(page) == FileContentType.IMG:
                ocr_engine2 = OcrAPI(
                    engine=Engine.ENGINE_2, api_key=os.getenv("OCR_API_KEY", "")
                )
                image_b64 = extract_image_base64(page)
                questions += ocr_engine2.ocr_base64(image_b64)
            elif file_type(page) == FileContentType.TEXT:
                questions += page.extract_text()
    extraction_agent = ExtractionAgent()
    extracted_questions = await extraction_agent.extract_questions(questions)
    await save_questions_in_db(
        questions=extracted_questions,
        **kwargs
    )


async def process_rag_material(
    rag_file_info: str, **kwargs
):
    """
    Processes RAG material from the uploaded file, splits and embeds text,
    and creates a FAISS index for semantic search.

    Args:
        rag_file_info (RagFileInfo): Contains rag file name and bytes.
        db (Database): The MongoDB database instance.
        user_id (ObjectId): The user's unique identifier.

    Returns:
        None
    """
    #TODO: Gotta use cognee


async def extract_and_save_answers(
    file_streams: List[BytesIO],
    filenames: List[str],
    **kwargs
):
    """
    Extracts answers from the uploaded answer file (PDF or TXT), processes them,
    and saves the extracted answers to the database.

    Args:
        answer_info (AnswerInfo): Contains answer file name and bytes.
        db (Database): The MongoDB database instance.
        **kwargs: Contains user_id (ObjectId) and exam_name (str)

    Returns:
        None
    """
    exam_id = kwargs.get("user_id")
    answers = ""
    for i in range(len(file_streams)):
        filename = filenames[i].lower()
        answer_bytes = file_streams[i]
        if filename.endswith(".txt"):
            answers += answer_bytes.getvalue().decode("utf-8")
        elif filename.endswith(".pdf"):
            reader = PdfReader(answer_bytes)
            for page in reader.pages:
                if file_type(page) == FileContentType.IMG:
                    ocr_engine2 = OcrAPI(
                        engine=Engine.ENGINE_2, api_key=os.environ["OCR_API_KEY"]
                    )
                    image_b64 = extract_image_base64(page)
                    answers += ocr_engine2.ocr_base64(image_b64)
                elif file_type(page) == FileContentType.TEXT:
                    answers += page.extract_text()
    extraction_agent = ExtractionAgent()
    question_dal = await get_question_dal()
    questions_cursor = await question_dal.get_questions(UUID(exam_id))
    query = "Question Paper:\n"
    for question in questions_cursor:
        query += str(question["question_number"]) + " " + question["text"] + "\n"
    query += "\nAnswer Body to be extracted\n\n" + answers
    extracted_answers = await extraction_agent.extract_answers(query)
    await save_answers_in_db(
        answers=extracted_answers, **kwargs
    )
