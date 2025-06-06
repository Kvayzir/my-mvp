from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import time
from typing import List, Optional

# Create FastAPI app
app = FastAPI(title="Chat Backend", version="1.0.0")

# Add CORS middleware to allow requests from your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Next.js default port: http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = "anonymous"

class ChatResponse(BaseModel):
    response: str
    timestamp: float
    response_time_ms: int

# Simple in-memory storage (use a database in production)
chat_history: List[dict] = []

# Simple bot responses - you can replace this with AI/ML models
BOT_RESPONSES = [
    "That's interesting! Tell me more.",
    "I understand what you're saying.",
    "Can you elaborate on that?",
    "That's a great point!",
    "I see what you mean.",
    "Thanks for sharing that with me.",
    "How does that make you feel?",
    "What do you think about that?",
    "That's really cool!",
    "I appreciate you telling me that."
]

KEYWORD_RESPONSES = {
    "hello": "Hello! Nice to meet you!",
    "hi": "Hi there! How are you doing?",
    "how are you": "I'm doing great, thanks for asking!",
    "bye": "Goodbye! Have a wonderful day!",
    "thanks": "You're very welcome!",
    "help": "I'm here to chat with you! Just send me any message.",
    "weather": "I wish I could check the weather for you, but I'm just a simple chat bot!",
    "time": f"I don't have real-time data, but when I last checked it was around {time.strftime('%H:%M')}",
}

def generate_response(message: str) -> str:
    """Generate a response based on the user's message"""
    message_lower = message.lower().strip()
    
    # Check for keyword responses first
    for keyword, response in KEYWORD_RESPONSES.items():
        if keyword in message_lower:
            return response
    
    # If no keywords match, return a random response
    return random.choice(BOT_RESPONSES)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Chat backend is running!", "status": "healthy"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(chat_message: ChatMessage):
    """Main chat endpoint"""
    start_time = time.time()
    
    try:
        # Validate input
        if not chat_message.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Store user message in history
        user_entry = {
            "type": "user",
            "message": chat_message.message,
            "user_id": chat_message.user_id,
            "timestamp": time.time()
        }
        chat_history.append(user_entry)
        
        # Generate bot response
        bot_response = generate_response(chat_message.message)
        
        # Store bot response in history
        bot_entry = {
            "type": "bot",
            "message": bot_response,
            "timestamp": time.time()
        }
        chat_history.append(bot_entry)
        
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
    # Return last 50 messages
    return {"history": chat_history[-50:], "total_messages": len(chat_history)}

@app.delete("/chat/history")
async def clear_chat_history():
    """Clear chat history"""
    global chat_history
    chat_history = []
    return {"message": "Chat history cleared"}

@app.get("/chat/stats")
async def get_chat_stats():
    """Get basic chat statistics"""
    user_messages = len([msg for msg in chat_history if msg["type"] == "user"])
    bot_messages = len([msg for msg in chat_history if msg["type"] == "bot"])
    
    return {
        "total_messages": len(chat_history),
        "user_messages": user_messages,
        "bot_messages": bot_messages,
        "unique_users": len(set(msg.get("user_id", "anonymous") for msg in chat_history if msg["type"] == "user"))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
