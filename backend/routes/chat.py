from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models import ChatRequest
from services.supabase_client import get_supabase_client
from services.gemini import generate_embedding, get_chat_session
import json

router = APIRouter()
supabase = get_supabase_client()

def fetch_relevant_context(document_id: str, query: str, top_k: int = 5) -> str:
    query_embedding = generate_embedding(query)
    if not query_embedding:
        return ""
    
    # Needs a similarity search RPC on Supabase:
    # We will assume an RPC function `match_document_chunks` exists, or we fetch all and calculate (not ideal).
    # Since we can't easily execute custom RPC creation via simple insert, we might fetch all chunks if small, 
    # but a proper pgvector implementation uses RPC. Let's write the RPC calling code.
    try:
        res = supabase.rpc(
            'match_document_chunks',
            {'query_embedding': query_embedding, 'match_threshold': 0.7, 'match_count': top_k, 'doc_id': document_id}
        ).execute()
        
        context_chunks = [item['content'] for item in res.data]
        return "\n\n".join(context_chunks)
    except Exception as e:
        print(f"RPC match_document_chunks failed, falling back to all content: {e}")
        # Fallback: get first few chunks
        fallback_res = supabase.table("document_chunks").select("content").eq("document_id", document_id).limit(5).execute()
        return "\n\n".join([chunk['content'] for chunk in fallback_res.data])

@router.post("/chat")
async def chat(request: ChatRequest):
    context = fetch_relevant_context(request.document_id, request.message)
    
    system_instruction = "You are a helpful AI Learning Assistant. Use the provided context to answer the user's question. If the answer is not in the context, say you don't know based on the provided document."
    
    # We inject context into the latest message
    prompt = f"Context:\n{context}\n\nUser Question: {request.message}"
    
    chat_session = get_chat_session(request.history)
    
    # Streaming response generator
    def stream_generator():
        try:
            response = chat_session.send_message(prompt, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            yield f"Error generating response: {e}"
            
    return StreamingResponse(stream_generator(), media_type="text/plain")
