from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
from typing import List, Optional
from dotenv import load_dotenv
from scripts.server import ChatServer

# Load environment variables from .env file
load_dotenv()

# Pydantic models for request/response
class UserRegistration(BaseModel):
    user_id: str
    classroom: Optional[str] = "null"

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = "anonymous"

class ChatResponse(BaseModel):
    response: str
    timestamp: float
    response_time_ms: int

class TopicMessage(BaseModel):
    topicSubject: str
    topicName: str
    topicInstructions: str
    topicContent: str

# Initialize components
chat_server = ChatServer()

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

@app.post("/user/register")
async def register_user(user: UserRegistration):
    """Register a new user"""
    print(f"Registering user: {user.user_id}")
    if not user.user_id.strip():
        raise HTTPException(status_code=400, detail="User ID cannot be empty")
    
    chat_server.register_user(user.user_id)
    return {"message": f"User '{user.user_id}' registered successfully"}

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

@app.post("/create_topic")
async def topic_endpoint(topic_message: TopicMessage):
    """Create a new topic for the chatbot"""
    try:
        # Validate input
        if not topic_message.topicName.strip():
            raise HTTPException(status_code=400, detail="Topic name cannot be empty")
        
        # Create topic in chat server
        print(f"Creating topic: {topic_message}")
        chat_server.create_topic(topic_message)
        return {"message": f"Topic '{topic_message.topicName}' created successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating topic: {str(e)}")

@app.get("/chat/topics")
async def get_topics():
    """Get list of available topics"""
    return ["topic1", "topic2", "topic3"]

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