import json
# Route to query criteria using Mistral
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import openai
from typing import Optional
import uuid
from fastapi import UploadFile, File, Form

# Load environment variables
load_dotenv()



# Initialize FastAPI app
app = FastAPI(
    title="FastAPI Backend",
    description="A FastAPI backend service with OpenAI integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure OpenAI
openai.api_key = os.getenv("GPT_API_KEY")

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "gpt-3.5-turbo"

class ChatResponse(BaseModel):
    response: str

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "FastAPI Backend is running!"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "fastapi-backend"}

@app.post("/chat", response_model=ChatResponse)
async def chat_with_gpt(request: ChatRequest):
    """
    Chat with OpenAI GPT model
    """
    try:
        if not openai.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        client = openai.OpenAI(api_key=openai.api_key)
        
        response = client.chat.completions.create(
            model=request.model,
            messages=[
                {"role": "user", "content": request.message}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return ChatResponse(response=response.choices[0].message.content)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/api/status")
async def api_status():
    """
    Get API status and configuration
    """
    return {
        "api_key_configured": bool(os.getenv("GPT_API_KEY")),
        "service": "fastapi",
        "version": "1.0.0"
    }



# --- ROUTE QUERY CRITERIA (placée après la création de app) ---
from fastapi import Body
from mistral_utils import extract_texts_from_pdfs, load_criteria_json, query_mistral_api


# Route to query criteria using Mistral
@app.post("/query_criteria/")
async def query_criteria(task_id: str = Body(..., embed=True)):
    """
    Prend en argument un task_id, extrait le texte des PDF du dossier temp associé,
    charge le JSON d'exemple, construit le prompt et interroge Mistral.
    """
    mistral_api_key = os.getenv("MISTRAL_API_KEY")
    if not mistral_api_key:
        raise HTTPException(status_code=500, detail="MISTRAL_API_KEY not configured")

    temp_dir = os.path.join(os.path.dirname(__file__), "temp", task_id)
    if not os.path.exists(temp_dir):
        raise HTTPException(status_code=404, detail="No documents found for this task_id")

    pdf_text = extract_texts_from_pdfs(temp_dir)
    criteria_json_path = os.path.join(os.path.dirname(__file__), "template", "example.json")
    criteria = load_criteria_json(criteria_json_path)

    contexte = (
        "TU est une ia qui doit generer un rapport sur un appel d'offre. "
        "l'appel d'offre est sous forme de document PDF. "
        "tu peux en avoir plusieurs à la fois ou meme le document peut etre un index au document principal. "
        "tu recevera aussi un fichier exel tu te contera juste de l'analyser. "
        "n'invente rien fait juste des conclusion a partir de ce que tu observes. "
        "je t'enverai un json avec les liste des critère du dois leur donner une note sur 20 dire la raison de ta desision ou un commentaire plus le code couleur de la note. "
        "rouge pour 0 et vert pour 20. "
        "tu me rend un json sous ce format."
    )

    prompt = (
        f"{contexte}\n\n"
        f"Voici le texte extrait des PDF :\n{pdf_text}\n\n"
        f"Voici un exemple de format de réponse :\n{json.dumps(criteria, ensure_ascii=False, indent=2)}"
    )

    result = query_mistral_api(prompt, mistral_api_key)
    try:
        return json.loads(result)
    except Exception:
        return {"raw_response": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


# Route to generate a new task ID
@app.post("/generate-task-id")
async def generate_task_id():
    """
    Generate a new unique task ID (UUID4)
    """
    task_id = str(uuid.uuid4())
    return {"task_id": task_id}


# Route to absorb (upload) multiple documents for a given task ID
from typing import List

@app.post("/absorb-document/")
async def absorb_document(task_id: str = Form(...), files: List[UploadFile] = File(...)):
    """
    Absorb multiple documents and save them in a subfolder named as the task ID.
    Each file is saved with its original filename. Allows multiple uploads for the same task ID.
    """
    temp_dir = os.path.join(os.path.dirname(__file__), "temp", task_id)
    os.makedirs(temp_dir, exist_ok=True)
    saved_files = []
    try:
        for file in files:
            file_path = os.path.join(temp_dir, file.filename)
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            saved_files.append(file_path)
        return {"message": f"{len(saved_files)} file(s) absorbed for task_id {task_id}", "saved_files": saved_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to absorb document(s): {str(e)}")
