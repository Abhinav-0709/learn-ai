import traceback
import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

try:
    response = client.post('/process-video', json={'youtube_url': 'https://www.youtube.com/watch?v=M988_fsOSWo'})
    print("STATUS:", response.status_code)
    print("JSON:", response.json())
except Exception as e:
    with open("error.txt", "w") as f:
        f.write(traceback.format_exc())

