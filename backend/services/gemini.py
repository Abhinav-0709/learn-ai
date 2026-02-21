import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY is not set.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Use gemini-2.5-flash for generation as requested by user
GENERATION_MODEL = "gemini-2.5-flash"
EMBEDDING_MODEL = "models/gemini-embedding-001" # Standard Gemini embedding model

def get_gemini_model():
    return genai.GenerativeModel(GENERATION_MODEL)

def generate_embedding(text: str) -> list[float]:
    """Generates an embedding for the given text using Gemini."""
    try:
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding'][:768]
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return []

def generate_json_response(prompt: str, schema=None) -> str:
    """Generates a JSON structured response from Gemini."""
    model = get_gemini_model()
    
    # We can enforce JSON output via system instruction or response_mime_type if needed.
    # The new SDK supports response_mime_type="application/json".
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        return response.text
    except Exception as e:
        print(f"Error generating JSON response: {e}")
        return "{}"

def get_chat_session(history=None):
    """Initializes a chat session, optionally with previous history."""
    model = get_gemini_model()
    # Format history if provided. The SDK expects a specific format or we can just pass the raw messages if they match.
    formatted_history = []
    if history:
        for msg in history:
             formatted_history.append({'role': msg.get('role', 'user'), 'parts': [msg.get('parts', '')]})
    return model.start_chat(history=formatted_history)
