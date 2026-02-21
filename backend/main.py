from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import processing, generation, chat

app = FastAPI(title="AI Learning Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(processing.router)
app.include_router(generation.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Learning Assistant API"}
