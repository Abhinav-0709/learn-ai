from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProcessVideoRequest(BaseModel):
    youtube_url: HttpUrl

class ProcessPdfRequest(BaseModel):
    pass # PDF processing usually uses multipart/form-data upload, not JSON body

class GenerateFlashcardsRequest(BaseModel):
    document_id: str

class GenerateQuizRequest(BaseModel):
    document_id: str

class ChatRequest(BaseModel):
    document_id: str
    message: str
    history: Optional[List[Dict[str, str]]] = [] # List of {"role": "user/assistant", "parts": "..."}

class DocumentResponse(BaseModel):
    document_id: str
    source_type: str
    title: str

class FlashcardResponse(BaseModel):
    front: str
    back: str

class QuizOption(BaseModel):
    option: str

class QuizResponse(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
