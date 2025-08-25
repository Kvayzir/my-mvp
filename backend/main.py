import traceback
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
from typing import Optional, List
from dotenv import load_dotenv

from scripts.server import AppService
from utils.messages import (
    UserRegistration,
    ChatMessage,
    ChatResponse,
    TopicMessage,
    ChatHistoryLoad,
    ConversationUpdate,
    TopicContent,
    MaterialInfo
)

# --- App Lifespan and Global Setup ---

load_dotenv()

chat_server_instance: AppService | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles application startup and shutdown events."""
    global chat_server_instance
    print("Starting up - initializing AppService...")
    chat_server_instance = AppService()
    yield
    print("Shutting down - cleaning up AppService...")
    if chat_server_instance:
        chat_server_instance.clear_local_chats()

def get_chat_server() -> AppService:
    """Dependency injection function to get the AppService instance."""
    if chat_server_instance is None:
        raise HTTPException(status_code=503, detail="AppService is not available")
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
    app_service: AppService = Depends(get_chat_server)
):
    """Registers a new user in the system."""
    if not user.user_id.strip():
        raise HTTPException(status_code=400, detail="User ID cannot be empty")
    
    print(f"Registering user: {user.user_id}")
    app_service.user_service.register_user(user.user_id)
    return {"message": f"User '{user.user_id}' registered successfully"}

# Router for Topic-related endpoints
router_topics = APIRouter(prefix="/topics", tags=["Topics"])

@router_topics.post("/", status_code=201)
async def create_topic(
    topic_message: TopicMessage,
    app_service: AppService = Depends(get_chat_server)
):
    """Creates a new topic for assignments."""
    if not topic_message.name.strip():
        raise HTTPException(status_code=400, detail="Topic name cannot be empty")
    
    try:
        print(f"Creating topic: {topic_message.name}")
        app_service.topic_service.create_topic(topic_message)
        return {"message": f"Topic '{topic_message.name}' created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating topic: {str(e)}")

@router_topics.get("/", response_model=list[str])
async def get_topics(user_id: Optional[str] = None, app_service: AppService = Depends(get_chat_server)):
    """
    Retrieves a list of available topics.
    - If no user_id is provided, it returns all topics.
    - If a user_id is provided as a query parameter, it returns topics for that user.
    """
    return app_service.topic_service.get_topics(user_id)

## Example of a topic content
from scripts.clients.mockup_database import TopicInformation, CELLS_TOPIC

@router_topics.get("/{topic_name}", response_model=TopicInformation)
async def get_topic_details(topic_name: str, app_service: AppService = Depends(get_chat_server)):
    """Retrieves contents of a specific topic."""
    try:
        # app_service.get_topic_contents(topic_name) is a placeholder for actual logic
        if topic_name != "celula":
            raise HTTPException(status_code=404, detail="Topic not found")
        return CELLS_TOPIC
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving topic: {str(e)}")

# Router for Simulations-related endpoints
router_simulations = APIRouter(prefix="/simulations", tags=["Simulations"])

@router_simulations.post("/start", response_model=ChatResponse)
async def start_simulation(
    content: List[MaterialInfo],
    app_service: AppService = Depends(get_chat_server)
):
    """Starts a simulation and returns the initial response."""
    try:
        print(f"Starting simulation with content: {content}")
        # bot_response = await app_service.simulation_service.start_simulation(content)
        return ChatResponse(
            response=f"Iniciando Simulación sobre {content[0].keyword}", #bot_response
            timestamp=time.time(),
            response_time_ms=0,
            complete=True
        )
    except Exception as e:
        print(f"CRITICAL ERROR: Unhandled exception in start_simulation: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error starting simulation: {str(e)}"
)

# Router for Conversation-related endpoints
router_conversations = APIRouter(prefix="/conversations", tags=["Conversations"])

@router_conversations.get("/{conversation_id}", response_model=ChatHistoryLoad)
async def start_conversation(
    conversation_id: str,
    app_service: AppService = Depends(get_chat_server)
):
    """Starts a conversation and returns the initial response."""
    print(f"Starting conversation with ID: {conversation_id}")
    try:
        user_id, topic = conversation_id.split("_", 1)
        print(f"Starting conversation for user {user_id} on topic {topic}")
        
        # Get or create conversation
        conversation_data = await app_service.chat_service.get_or_create_conversation(user_id, topic)
        print(f"DEBUG: Successfully retrieved conversation object.")
        print(f"DEBUG: Conversation details: {conversation_data}")

        return ChatHistoryLoad(
            conversation_id=conversation_id,
            messages=conversation_data
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation_id format. Expected 'user_id_topic'.")
    except Exception as e:
        print(f"CRITICAL ERROR: Unhandled exception in start_conversation: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error starting conversation: {str(e)}")

@router_conversations.post("/{conversation_id}/messages", response_model=ChatResponse)
async def post_message_to_conversation(
    conversation_id: str,
    chat_message: ChatMessage,
    app_service: AppService = Depends(get_chat_server)
):
    """Sends a message to a conversation and gets an AI response."""
    if not chat_message.msg.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    print(f"Received message for conversation {conversation_id}: {chat_message.msg}")
    start_time = time.time()
    try:
        user_id, topic = conversation_id.split("_", 1)
            
        bot_response, counter = await app_service.chat_service.process_user_message(user_id, topic, chat_message)
        
        response_time = int((time.time() - start_time) * 1000)
        
        return ChatResponse(
            response=bot_response,
            timestamp=time.time(),
            response_time_ms=response_time,
            complete=int(counter) > 10
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
    app_service: AppService = Depends(get_chat_server)
):
    """Updates the conversation's context, such as when an icon is clicked."""
    try:
        user_id, topic = conversation_id.split("_", 1)
        response = await app_service.chat_service.update_conversation_context(user_id, topic, update_data.active_icon_content)
        if response:
            return {"status": "success", "message": response}
        else:
            raise HTTPException(status_code=404, detail="Conversation not found or could not be updated.")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation_id format. Expected 'user_id_topic'.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Root and Health Check ---

@app.get("/", tags=["Health"])
async def root(app_service: AppService = Depends(get_chat_server)):
    """Health check endpoint to ensure the server is running."""
    return app_service.get_health_status()

# --- Include Routers in the App ---

app.include_router(router_users)
app.include_router(router_topics)
app.include_router(router_conversations)
app.include_router(router_simulations)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)