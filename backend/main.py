import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import openai
from typing import Optional

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
