from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
from typing import List, Optional
from dotenv import load_dotenv
from scripts.chatbot import ChatBot
from scripts.server import ChatServer

# Load environment variables from .env file
load_dotenv()

# Pydantic models for request/response
class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = "anonymous"

class ChatResponse(BaseModel):
    response: str
    timestamp: float
    response_time_ms: int

# Initialize components
chat_server = ChatServer()
chatbot = ChatBot()

# Create FastAPI app
app = FastAPI(title="Chat Backend with Llama", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return chat_server.get_health_status()

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(chat_message: ChatMessage):
    """Main chat endpoint with Llama AI response"""
    start_time = time.time()
    
    try:
        # Validate input
        if not chat_message.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Process message through chat server
        bot_response = chat_server.process_message(
            message=chat_message.message,
            user_id=chat_message.user_id,
            chatbot=chatbot
        )
        
        # Calculate response time
        response_time = int((time.time() - start_time) * 1000)
        
        return ChatResponse(
            response=bot_response,
            timestamp=time.time(),
            response_time_ms=response_time
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.get("/chat/history")
async def get_chat_history():
    """Get recent chat history"""
    return chat_server.get_chat_history()

@app.delete("/chat/history")
async def clear_chat_history():
    """Clear chat history"""
    return chat_server.clear_chat_history()

@app.get("/chat/stats")
async def get_chat_stats():
    """Get basic chat statistics"""
    return chat_server.get_chat_stats()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)