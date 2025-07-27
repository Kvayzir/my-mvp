import traceback
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
    ConversationUpdate,
    TopicContent
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

# Example of a topic content
sample = {
    'name': 'celula',
    'icon': '🧿',
    'description': 'This is a sample topic description for "celula".', 
    'contents': [
        {'level': 2, 'color': 'purple', 'title': 'core', 'icon': '🧿', 'description': 'Cuando se mira una imagen de la célula, el núcleo es una de las partes más evidentes. Está en el centro de la célula, y contiene todos los cromosomas de la misma, los cuales codifican el material genético. Es, por lo tanto, una parte a proteger, es realmente importante para la célula. El núcleo tiene una membrana que lo rodea y que mantiene todos los cromosomas en el interior; y separa los cromosomas del interior del núcleo y el resto de los orgánulos y componentes de la célula que se quedan fuera. Algunas cosas, como el ARN, necesitan circular entre el núcleo y el citoplasma. Para ello, hay poros en esta envoltura nuclear que permiten que las moléculas entren y salgan del núcleo. Antes se pensaba que la membrana nuclear sólo permitía la salida de las moléculas, pero ahora se sabe que también hay un proceso activo para introducir moléculas en el núcleo'},
        {'level': 2, 'color': 'teal', 'title': 'Ciudad', 'icon': '🏙️', 'description': 'Imagina una ciudad en miniatura: hay una planta eléctrica (mitocondria), una oficina de correos (aparato de Golgi), fábricas (ribosomas), centros de reciclaje (lisosomas), calles (citoplasma) y, por supuesto, un ayuntamiento con los planos de construcción: el núcleo.'},
        {'level': 2, 'color': 'gray', 'title': 'Secret', 'icon': '㊙️', 'description': 'Imaginen que están diseñando una base secreta en un videojuego. Necesitan un lugar donde se tomen decisiones (núcleo), máquinas que fabriquen cosas (ribosomas, RER), almacenes (vacuolas) y generadores de energía (mitocondrias). ¿Qué tan eficiente sería tu base? Vamos a descubrir cómo lo hace la naturaleza.'},
        {'level': 2, 'color': 'indigo', 'title': 'microscopio', 'icon': '🛩️', 'description': 'Hoy haremos un viaje microscópico dentro de una célula. Prepárate para flotar por el citoplasma, explorar estructuras llenas de energía y llegar al lugar más protegido de todos: el núcleo, donde se guardan los secretos de la vida.'},
        {'level': 1, 'color': 'yellow', 'title': 'energy', 'icon': '🔋', 'description': 'Aquí hablamos de mitocondrias, cloroplastos, lisosomas, y vacuolas'},
        {'level': 1, 'color': 'red', 'title': 'sustances', 'icon': '⚙️', 'description': 'Ribosomas, RER, REL, aparato de Golgi'},
        {'level': 1, 'color': 'green', 'title': 'citoesqueleto', 'icon': '🩻', 'description': 'Citoesqueleto: microfilamentos, filamentos intermedios y microtúbulos. Estos son los componentes que dan forma a la célula, como si fueran los huesos y músculos de un cuerpo.'},
        {'level': 1, 'color': 'indigo', 'title': 'nucleo', 'icon': '🧬', 'description': 'Forma, adn, genes, partes...'},
        {'level': 0, 'color': 'purple', 'title': 'goal', 'icon': '🎯', 'description': 'Aquí evaluamos al alumno.'}
    ]
}

@router_topics.get("/{topic_name}", response_model=TopicContent)
async def get_topic_details(topic_name: str, chat_server: ChatServer = Depends(get_chat_server)):
    """Retrieves contents of a specific topic."""
    try:
        # chat_server.get_topic_contents(topic_name) is a placeholder for actual logic
        if topic_name != "celula":
            raise HTTPException(status_code=404, detail="Topic not found")
        return sample
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving topic: {str(e)}")

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

@router_conversations.get("/{conversation_id}", response_model=ChatHistoryLoad)
async def start_conversation(
    conversation_id: str,
    chat_server: ChatServer = Depends(get_chat_server)
):
    """Starts a conversation and returns the initial response."""
    print(f"Starting conversation with ID: {conversation_id}")
    try:
        user_id, topic = conversation_id.split("_", 1)
        print(f"Starting conversation for user {user_id} on topic {topic}")
        
        # Get or create conversation
        conversation_data = await chat_server.get_conversation(user_id, topic)
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
    chat_server: ChatServer = Depends(get_chat_server)
):
    """Sends a message to a conversation and gets an AI response."""
    if not chat_message.msg.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    print(f"Received message for conversation {conversation_id}: {chat_message.msg}")
    start_time = time.time()
    try:
        user_id, topic = conversation_id.split("_", 1)
            
        bot_response, counter = await chat_server.process_message(user_id, topic, chat_message)
        
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