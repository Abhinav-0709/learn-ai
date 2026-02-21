import re
import youtube_transcript_api
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

def extract_youtube_video_id(url: str) -> str:
    """Extracts the video ID from a YouTube URL."""
    video_id_match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
    if video_id_match:
        return video_id_match.group(1)
    return ""

import youtube_transcript_api

def get_youtube_transcript(video_id: str) -> tuple[str, str]:
    """Fetches the transcript of a YouTube video."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        transcript_obj = YouTubeTranscriptApi().list(video_id).find_transcript(['en'])
        transcript_list = transcript_obj.fetch()
        transcript = " ".join([t.text for t in transcript_list])
        return transcript, ""
    except Exception as e:
        err = str(e)
        print(f"Error fetching transcript: {err}")
        if "YouTube is blocking requests" in err or "cloud provider" in err:
            return "", "YouTube is blocking requests from this server's IP address (a common restriction for free cloud platforms). Please try the PDF upload feature instead!"
        return "", "Could not fetch transcript. Make sure the video has public English subtitles."

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts text from a given PDF file path."""
    text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """Splits a large text into smaller chunks."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )
    chunks = text_splitter.split_text(text)
    return chunks
