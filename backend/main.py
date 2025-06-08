from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import requests
import os
from typing import List, Optional

# Create FastAPI app
app = FastAPI(title="Chat Backend with Llama", version="1.0.0")

# Add CORS middleware to allow requests from your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
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

# Simple in-memory storage for chat history
chat_history: List[dict] = []

# Hugging Face configuration
HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct"
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")  # We'll set this as environment variable

def query_llama(messages: List[dict], max_tokens: int = 150) -> str:
    """
    Query Llama model via Hugging Face Inference API
    """
    if not HF_TOKEN:
        raise Exception("Hugging Face token not configured")
    
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Format messages for Llama chat template
    conversation = ""
    for msg in messages:
        if msg["role"] == "user":
            conversation += f"<|start_header_id|>user<|end_header_id|>\n{msg['content']}<|eot_id|>"
        elif msg["role"] == "assistant":
            conversation += f"<|start_header_id|>assistant<|end_header_id|>\n{msg['content']}<|eot_id|>"
    
    # Add the assistant start token for the response
    conversation += "<|start_header_id|>assistant<|end_header_id|>\n"
    
    payload = {
        "inputs": conversation,
        "parameters": {
            "max_new_tokens": max_tokens,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True,
            "stop": ["<|eot_id|>", "<|end_of_text|>"]
        }
    }
    
    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        
        # Handle different response formats
        if isinstance(result, list) and len(result) > 0:
            generated_text = result[0].get("generated_text", "")
        elif isinstance(result, dict):
            generated_text = result.get("generated_text", "")
        else:
            raise Exception(f"Unexpected response format: {result}")
        
        # Extract only the new response (remove the input conversation)
        if conversation in generated_text:
            new_response = generated_text.replace(conversation, "").strip()
        else:
            new_response = generated_text.strip()
        
        # Clean up the response
        new_response = new_response.replace("<|eot_id|>", "").replace("<|end_of_text|>", "").strip()
        
        return new_response if new_response else "I'm not sure how to respond to that."
        
    except requests.exceptions.Timeout:
        raise Exception("Request timed out - the model might be loading")
    except requests.exceptions.RequestException as e:
        raise Exception(f"API request failed: {str(e)}")
    except Exception as e:
        raise Exception(f"Error processing response: {str(e)}")

def generate_response_with_llama(message: str, user_id: str = "anonymous") -> str:
    """Generate response using Llama via Hugging Face API"""
    
    try:
        # Get recent conversation history for context
        recent_messages = []
        for msg in chat_history[-10:]:  # Last 10 messages for context
            if msg["type"] == "user":
                recent_messages.append({"role": "user", "content": msg["message"]})
            elif msg["type"] == "bot":
                recent_messages.append({"role": "assistant", "content": msg["message"]})
        
        # Add current user message
        recent_messages.append({"role": "user", "content": message})
        
        # Add system prompt if it's the first message
        if len(recent_messages) == 1:
            system_message = {"role": "user", "content": "You are a helpful and friendly AI assistant. Please provide helpful, accurate, and engaging responses."}
            recent_messages.insert(0, system_message)
        
        # Query Llama
        response = query_llama(recent_messages)
        return response
        
    except Exception as e:
        print(f"Error with Llama API: {e}")
        return generate_fallback_response(message)

def generate_fallback_response(message: str) -> str:
    """Fallback responses when Llama API isn't available"""
    message_lower = message.lower().strip()
    
    if any(word in message_lower for word in ["hello", "hi", "hey"]):
        return "Hello! I'm having trouble connecting to my AI brain right now, but I'm here to chat!"
    elif any(word in message_lower for word in ["how are you", "how's it going"]):
        return "I'm doing well, thanks! Though I should mention I'm running on backup responses right now."
    elif any(word in message_lower for word in ["bye", "goodbye", "see you"]):
        return "Goodbye! Hope to chat with you again soon!"
    elif "help" in message_lower:
        return "I'm here to help! I'm currently running on simple responses, but I can still try to assist you."
    else:
        return "That's interesting! I'm currently having trouble with my main AI system, but I'm still here to chat with you."

@app.get("/")
async def root():
    """Health check endpoint"""
    api_status = "configured" if HF_TOKEN else "not configured"
    return {
        "message": "Chat backend with Llama is running!", 
        "status": "healthy",
        "huggingface_api": api_status
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(chat_message: ChatMessage):
    """Main chat endpoint with Llama AI response"""
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
        
        # Generate response using Llama or fallback
        if HF_TOKEN:
            bot_response = generate_response_with_llama(chat_message.message, chat_message.user_id)
        else:
            bot_response = generate_fallback_response(chat_message.message)
        
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
        "unique_users": len(set(msg.get("user_id", "anonymous") for msg in chat_history if msg["type"] == "user")),
        "llama_api_configured": HF_TOKEN is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
