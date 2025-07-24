# backend/main.py
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
from typing import Optional
from dotenv import load_dotenv

from scripts.server import ChatServer
from utils.messages import (
    UserRegistration,
    ChatMessage,
    ChatResponse,
    TopicMessage,
    ChatHistoryLoad,
    ConversationUpdate
)

# --- App Lifespan and Global Setup ---

load_dotenv()

chat_server_instance: ChatServer | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles application startup and shutdown events."""
    global chat_server_instance
    print("Starting up - initializing ChatServer...")
    chat_server_instance = ChatServer()
    yield
    print("Shutting down - cleaning up ChatServer...")
    if chat_server_instance:
        chat_server_instance.clear_local_chats()

def get_chat_server() -> ChatServer:
    """Dependency injection function to get the ChatServer instance."""
    if chat_server_instance is None:
        raise HTTPException(status_code=503, detail="ChatServer is not available")
    return chat_server_instance

# --- FastAPI App Initialization ---

app = FastAPI(
    lifespan=lifespan,
    title="AI Learning Assistant API",
    version="1.0.0",
    description="Backend API for the AI-powered teaching assistant MVP.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Routers ---

# Router for User-related endpoints
router_users = APIRouter(prefix="/users", tags=["Users"])

@router_users.post("/", status_code=201)
async def register_user(
    user: UserRegistration,
    chat_server: ChatServer = Depends(get_chat_server)
):
    """Registers a new user in the system."""
    if not user.user_id.strip():
        raise HTTPException(status_code=400, detail="User ID cannot be empty")
    
    print(f"Registering user: {user.user_id}")
    chat_server.register_user(user.user_id)
    return {"message": f"User '{user.user_id}' registered successfully"}

# Router for Topic-related endpoints
router_topics = APIRouter(prefix="/topics", tags=["Topics"])

@router_topics.post("/", status_code=201)
async def create_topic(
    topic_message: TopicMessage,
    chat_server: ChatServer = Depends(get_chat_server)
):
    """Creates a new topic for assignments."""
    if not topic_message.name.strip():
        raise HTTPException(status_code=400, detail="Topic name cannot be empty")
    
    try:
        print(f"Creating topic: {topic_message.name}")
        chat_server.create_topic(topic_message)
        return {"message": f"Topic '{topic_message.name}' created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating topic: {str(e)}")

@router_topics.get("/", response_model=list[str])
async def get_topics(user_id: Optional[str] = None, chat_server: ChatServer = Depends(get_chat_server)):
    """
    Retrieves a list of available topics.
    - If no user_id is provided, it returns all topics.
    - If a user_id is provided as a query parameter, it returns topics for that user.
    """
    return chat_server.get_topics(user_id)

# Router for Conversation-related endpoints
router_conversations = APIRouter(prefix="/conversations", tags=["Conversations"])

@router_conversations.get("/{user_id}/{topic}", response_model=ChatHistoryLoad)
async def get_conversation_history(
    user_id: str,
    topic: str,
    chat_server: ChatServer = Depends(get_chat_server)
):
    """Loads the initial chat history for a user and topic."""
    try:
        msg_list = chat_server.load_chat(user_id, topic)
        return ChatHistoryLoad(msgList=msg_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading chat: {str(e)}")

@router_conversations.post("/{conversation_id}/messages", response_model=ChatResponse)
async def post_message_to_conversation(
    conversation_id: str,
    chat_message: ChatMessage,
    chat_server: ChatServer = Depends(get_chat_server)
):
    """Sends a message to a conversation and gets an AI response."""
    if not chat_message.msg.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    start_time = time.time()
    try:
        user_id, topic = conversation_id.split("_", 1)
        
        # Ensure the user_id from the path matches the one in the message body
        if user_id != chat_message.user_id:
            raise HTTPException(status_code=400, detail="Path user_id does not match message user_id")
            
        bot_response = await chat_server.process_message(user_id, topic, chat_message)
        
        response_time = int((time.time() - start_time) * 1000)
        
        return ChatResponse(
            response=bot_response,
            timestamp=time.time(),
            response_time_ms=response_time
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation_id format. Expected 'user_id_topic'.")
    except Exception as e:
        print(f"❌ Error processing message: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router_conversations.patch("/{conversation_id}")
async def update_conversation_context(
    conversation_id: str,
    update_data: ConversationUpdate,
    chat_server: ChatServer = Depends(get_chat_server)
):
    """Updates the conversation's context, such as when an icon is clicked."""
    try:
        user_id, topic = conversation_id.split("_", 1)
        success = await chat_server.patch_conversation(user_id, topic, update_data.active_icon_content)
        if success:
            return {"status": "success", "message": "Conversation context updated."}
        else:
            raise HTTPException(status_code=404, detail="Conversation not found or could not be updated.")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation_id format. Expected 'user_id_topic'.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router_conversations.get("/stats")
async def get_conversation_stats(chat_server: ChatServer = Depends(get_chat_server)):
    """Gets overall statistics about all conversations."""
    return chat_server.get_chat_stats()

# --- Root and Health Check ---

@app.get("/", tags=["Health"])
async def root(chat_server: ChatServer = Depends(get_chat_server)):
    """Health check endpoint to ensure the server is running."""
    return chat_server.get_health_status()

# --- Include Routers in the App ---

app.include_router(router_users)
app.include_router(router_topics)
app.include_router(router_conversations)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)