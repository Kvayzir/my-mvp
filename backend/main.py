from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import time
from dotenv import load_dotenv
from scripts.server import ChatServer
from utils.messages import (
    UserRegistration,
    ChatMessage,
    ChatResponse,
    TopicMessage
)

# Load environment variables from .env file
load_dotenv()

# Initialize components
def get_chat_server():
    """Dependency to get the chat server instance"""
    return ChatServer()

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
async def root(chat_server: ChatServer = Depends(get_chat_server)):
    """Health check endpoint"""
    return chat_server.get_health_status()

@app.post("/user/register")
async def register_user(
    user: UserRegistration, 
    chat_server: ChatServer = Depends(get_chat_server)
):
    """Register a new user"""
    print(f"Registering user: {user.user_id}")
    if not user.user_id.strip():
        raise HTTPException(status_code=400, detail="User ID cannot be empty")
    
    chat_server.register_user(user.user_id)
    return {"message": f"User '{user.user_id}' registered successfully"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    chat_message: ChatMessage,
    chat_server: ChatServer = Depends(get_chat_server)
):
    """Main chat endpoint with Llama AI response"""
    start_time = time.time()
    
    try:
        # Validate input
        if not chat_message.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Process message through chat server
        bot_response = await chat_server.process_message(chat_message)
        
        # Calculate response time
        response_time = int((time.time() - start_time) * 1000)
        
        return ChatResponse(
            response=bot_response,
            timestamp=time.time(),
            response_time_ms=response_time
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.post("/topics/create")
async def topic_endpoint(
    topic_message: TopicMessage,
    chat_server: ChatServer = Depends(get_chat_server)
):
    try:
        # Validate input
        if not topic_message.name.strip():
            raise HTTPException(status_code=400, detail="Topic name cannot be empty")
        
        # Create topic in chat server
        print(f"Creating topic: {topic_message}")
        chat_server.create_topic(topic_message)
        return {"message": f"Topic '{topic_message.name}' created successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating topic: {str(e)}")

@app.get("/topics/overview")
async def get_topics(
    chat_server: ChatServer = Depends(get_chat_server)
):
    return chat_server.get_topics()

@app.get("/chat/{user_id}/{theme}/history")
async def get_chat_history(
    user_id: str,
    theme: str,
    chat_server: ChatServer = Depends(get_chat_server)
):
    return chat_server.get_chat_history(user_id, theme)

@app.delete("/chat/history")
async def clear_chat_history(
    chat_server: ChatServer = Depends(get_chat_server)
):
    return chat_server.clear_chat_history()

@app.get("/chat/stats")
async def get_chat_stats(
    chat_server: ChatServer = Depends(get_chat_server)
):
    return chat_server.get_chat_stats()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)