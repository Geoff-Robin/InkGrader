"""
Utility functions for processing exam files, extracting questions and answers,
and handling RAG material indexing for the AutoCorrector backend.

Includes PDF and text file handling, OCR integration, and database operations.
"""

import os
from FileProcessor import OcrAPI, FileContentType, Engine
from pypdf import PdfReader
from io import BytesIO
from models import *
from Agents.extraction_agent import ExtractionAgent
from pymongo.database import Database
from Agents.rag_pipeline import *
from sklearn.pipeline import Pipeline
from pypdf import PdfReader
from io import BytesIO
import faiss
from typing import Annotated
from fastapi import File, UploadFile
from FileProcessor.helpers import *


async def extract_and_save_questions(
    question_info: QuestionInfo, db: Database, **kwargs
):
    """
    Extracts questions from the uploaded exam file (PDF or TXT), processes them,
    and saves the extracted questions to the database.

    Args:
        question_info (QuestionInfo): Contains question filename and question file bytes
        db (Database): The MongoDB database instance.
        **kwargs: Contains user_id (ObjectId) and exam_name (str)

    Returns:
        None
    """
    questions = ""
    if question_info.file_name.endswith(".txt"):
        questions = question_info.questions.getvalue().decode("utf-8")
        extraction_agent = ExtractionAgent()
        extracted_questions = await extraction_agent.extract_questions(questions)
    elif question_info.file_name.endswith(".pdf"):
        reader = PdfReader(question_info.questions)
        for page in reader.pages:
            if file_type(page) == FileContentType.IMG:
                ocr_engine2 = OcrAPI(
                    engine=Engine.ENGINE_2, api_key=os.getenv("OCR_API_KEY")
                )
                image_b64 = extract_image_base64(page)
                questions += ocr_engine2.ocr_base64(image_b64)
            elif file_type(page) == FileContentType.TEXT:
                questions += page.extract_text()
    extraction_agent = ExtractionAgent()
    extracted_questions = await extraction_agent.extract_questions(questions)
    await save_questions_in_db(
        user_id=kwargs.get("user_id"),
        exam_name=kwargs.get("exam_name"),
        questions=extracted_questions,
        db=db,
    )


def extract_text_from_pdf(pdf_bytes: BytesIO) -> str:
    """
    Extracts text from all pages of a PDF file.

    Args:
        pdf_bytes (BytesIO): The PDF file as a BytesIO object.

    Returns:
        str: The extracted text from the PDF.
    """
    reader = PdfReader(pdf_bytes)
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages)


async def process_rag_material(
    rag_file_info: RagFileInfo, db: Database, **kwargs
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
    user_id = kwargs.get("user_id")
    exam_name = kwargs.get("exam_name")
    data = rag_file_info.rag_material
    fname = rag_file_info.file_name.lower()
    if fname.endswith(".pdf"):
        content = extract_text_from_pdf(data)
    elif fname.endswith(".txt"):
        content = data.getvalue().decode("utf-8")
    else:
        raise ValueError("Unsupported file type; use .txt or .pdf")

    embedder = TransformerEmbedder()
    splitter = SentenceSplitter()
    chunks = splitter.transform([content])
    embeddings = embedder.transform(chunks)
    
    assert len(chunks) == len(embeddings), "Mismatch between chunks and embeddings"
    
    fetch_results = await db["Questions"].find_one({
        "exam_name": exam_name,
        "user_id": user_id
    })
    await db["Chunks"].insert_one(
        {"exam_id": fetch_results["_id"], "user_id": user_id, "chunks": chunks}
    )
    faiss.normalize_L2(embeddings)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    embeddings = np.array(embeddings, dtype="float32")
    index.add(embeddings)
    os.makedirs("faiss_indexes", exist_ok=True)
    index_name = f"{fetch_results['_id']}_{str(user_id)}.faiss"
    path = os.path.join("faiss_indexes", index_name)
    faiss.write_index(index, path)


async def extract_and_save_answers(
    db: Database,
    answer_info: AnswerInfo,
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
    user_id = kwargs.get("user_id")
    exam_name = kwargs.get("exam_name")
    answers = ""
    for answer_bytes in answer_info.student_answers:
        data = BytesIO(answer_bytes)
        filename = answer_info.file_name.lower()
        if filename.endswith(".txt"):
            answers += data.getvalue().decode("utf-8")
        elif filename.endswith(".pdf"):
            reader = PdfReader(data)
            for page in reader.pages:
                if file_type(page) == FileContentType.IMG:
                    ocr_engine2 = OcrAPI(
                        engine=Engine.ENGINE_2, api_key=os.getenv("OCR_API_KEY")
                    )
                    image_b64 = extract_image_base64(page)
                    answers += ocr_engine2.ocr_base64(image_b64)
                elif file_type(page) == FileContentType.TEXT:
                    answers += page.extract_text()
    extraction_agent = ExtractionAgent()
    questions_cursor = await db["Questions"].find_one({"user_id": user_id, "exam_name": exam_name})
    query = "Question Paper:\n"
    for question in questions_cursor["questions"]:
        query += str(question["question_id"]) + " " + question["question"] + "\n"
    query += "\nAnswer Body to be extracted\n\n" + answers
    extracted_answers = await extraction_agent.extract_answers(query)
    find_result = await db["Questions"].find_one({
        "exam_name": exam_name,
        "user_id": user_id
    })
    await save_answers_in_db(
        user_id=user_id, exam_id=find_result["_id"], answers=extracted_answers, db=db, file_name=filename
    )
