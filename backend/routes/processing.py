import os
from fastapi import APIRouter, HTTPException, UploadFile, File
from models import ProcessVideoRequest, DocumentResponse
from utils.chunking import extract_youtube_video_id, get_youtube_transcript, extract_text_from_pdf, chunk_text
from services.gemini import generate_embedding
from services.supabase_client import get_supabase_client

router = APIRouter()
supabase = get_supabase_client()

@router.post("/process-video", response_model=DocumentResponse)
async def process_video(request: ProcessVideoRequest):
    video_id = extract_youtube_video_id(str(request.youtube_url))
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    transcript, err_message = get_youtube_transcript(video_id)
    if not transcript:
        raise HTTPException(status_code=400, detail=err_message)

    # Store document metadata
    try:
        doc_res = supabase.table("documents").insert({
            "source_type": "youtube",
            "source_url": str(request.youtube_url),
            "title": f"YouTube Video {video_id}" # Ideally we'd fetch the real title using YouTube Data API
        }).execute()
    except Exception as e:
        print(f"Supabase Document Insert Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    document_id = doc_res.data[0]['id']

    # Chunk and embed
    chunks = chunk_text(transcript)
    for i, chunk in enumerate(chunks):
        embedding = generate_embedding(chunk)
        if embedding:
            supabase.table("document_chunks").insert({
                "document_id": document_id,
                "content": chunk,
                "embedding": embedding,
                "metadata": {"chunk_index": i}
            }).execute()

    return DocumentResponse(
        document_id=document_id,
        source_type="youtube",
        title=f"YouTube Video {video_id}"
    )

@router.post("/process-pdf", response_model=DocumentResponse)
async def process_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    # Read file content temporarily
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    
    text = extract_text_from_pdf(temp_path)
    os.remove(temp_path)

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    # Store document metadata
    doc_res = supabase.table("documents").insert({
        "source_type": "pdf",
        "title": file.filename
    }).execute()
    
    document_id = doc_res.data[0]['id']

    # Chunk and embed
    chunks = chunk_text(text)
    for i, chunk in enumerate(chunks):
        embedding = generate_embedding(chunk)
        if embedding:
            supabase.table("document_chunks").insert({
                "document_id": document_id,
                "content": chunk,
                "embedding": embedding,
                "metadata": {"chunk_index": i}
            }).execute()

    return DocumentResponse(
        document_id=document_id,
        source_type="pdf",
        title=file.filename
    )
