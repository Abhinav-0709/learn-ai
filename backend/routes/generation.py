import json
from fastapi import APIRouter, HTTPException
from models import GenerateFlashcardsRequest, GenerateQuizRequest
from services.supabase_client import get_supabase_client
from services.gemini import generate_json_response

router = APIRouter()
supabase = get_supabase_client()

def get_document_content(document_id: str) -> str:
    # Fetch top chunks for this document (could just fetch all if small, but let's fetch all chunks for context)
    res = supabase.table("document_chunks").select("content").eq("document_id", document_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found or has no content")
    return "\n".join([chunk['content'] for chunk in res.data])

@router.post("/generate-flashcards")
async def generate_flashcards(request: GenerateFlashcardsRequest):
    content = get_document_content(request.document_id)
    
    prompt = f"""
    Create 10 to 15 highly effective flashcards based on the following text.
    Return strictly a JSON array of objects, where each object has "front" and "back" keys.
    Text: {content[:10000]} # Limiting context window slightly for prompt safety if huge
    """
    
    response_text = generate_json_response(prompt)
    try:
        flashcards = json.loads(response_text)
        
        # Save to database
        for fc in flashcards:
            supabase.table("flashcards").insert({
                "document_id": request.document_id,
                "front": fc.get("front", ""),
                "back": fc.get("back", "")
            }).execute()
            
        return {"flashcards": flashcards}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse Gemini output into JSON")

@router.post("/generate-quiz")
async def generate_quiz(request: GenerateQuizRequest):
    content = get_document_content(request.document_id)
    
    prompt = f"""
    Create 5 to 10 multiple-choice questions based on the following text.
    Return strictly a JSON array of objects. 
    Each object must have "question", "options" (an array of 4 string options), and "correct_answer" (must exactly match one of the options).
    Text: {content[:10000]}
    """
    
    response_text = generate_json_response(prompt)
    try:
        quizzes = json.loads(response_text)
        
        # Save to database
        for q in quizzes:
            supabase.table("quizzes").insert({
                "document_id": request.document_id,
                "question": q.get("question", ""),
                "options": q.get("options", []),
                "correct_answer": q.get("correct_answer", "")
            }).execute()
            
        return {"quizzes": quizzes}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse Gemini output into JSON")
