"""
Server module handling chat operations, history management, and statistics.
"""
import time
import os
from typing import List, Dict, Any

class ChatServer:
    """Manages chat sessions, history, and server operations."""
    
    def __init__(self):
        """Initialize the chat server with empty history."""
        self.chat_history: List[Dict[str, Any]] = []
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")
    
    def process_message(self, message: str, user_id: str, chatbot) -> str:
        """
        Process a user message and generate a response.
        
        Args:
            message: The user's message
            user_id: Unique identifier for the user
            chatbot: ChatBot instance to generate responses
            
        Returns:
            Generated response string
        """
        # Store user message in history
        user_entry = {
            "type": "user",
            "message": message,
            "user_id": user_id,
            "timestamp": time.time()
        }
        self.chat_history.append(user_entry)
        
        # Generate response using chatbot
        bot_response = chatbot.generate_response(message, user_id, self.chat_history)
        
        # Store bot response in history
        bot_entry = {
            "type": "bot",
            "message": bot_response,
            "timestamp": time.time()
        }
        self.chat_history.append(bot_entry)
        
        return bot_response
    
    def get_chat_history(self, limit: int = 50) -> Dict[str, Any]:
        """
        Get recent chat history.
        
        Args:
            limit: Maximum number of messages to return
            
        Returns:
            Dictionary containing history and total message count
        """
        return {
            "history": self.chat_history[-limit:], 
            "total_messages": len(self.chat_history)
        }
    
    def clear_chat_history(self) -> Dict[str, str]:
        """
        Clear all chat history.
        
        Returns:
            Confirmation message
        """
        self.chat_history = []
        return {"message": "Chat history cleared"}
    
    def get_chat_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive chat statistics.
        
        Returns:
            Dictionary containing various chat statistics
        """
        user_messages = len([msg for msg in self.chat_history if msg["type"] == "user"])
        bot_messages = len([msg for msg in self.chat_history if msg["type"] == "bot"])
        unique_users = len(set(
            msg.get("user_id", "anonymous") 
            for msg in self.chat_history 
            if msg["type"] == "user"
        ))
        
        return {
            "total_messages": len(self.chat_history),
            "user_messages": user_messages,
            "bot_messages": bot_messages,
            "unique_users": unique_users,
            "llama_api_configured": self.hf_token is not None
        }
    
    def get_health_status(self) -> Dict[str, str]:
        """
        Get server health status.
        
        Returns:
            Health status information
        """
        api_status = "configured" if self.hf_token else "not configured"
        return {
            "message": "Chat backend with Llama is running!", 
            "status": "healthy",
            "huggingface_api": api_status
        }
    
    def get_conversation_context(self, limit: int = 10) -> List[Dict[str, str]]:
        """
        Get recent conversation context for AI model.
        
        Args:
            limit: Maximum number of recent messages to include
            
        Returns:
            List of formatted messages for AI context
        """
        recent_messages = []
        for msg in self.chat_history[-limit:]:
            if msg["type"] == "user":
                recent_messages.append({"role": "user", "content": msg["message"]})
            elif msg["type"] == "bot":
                recent_messages.append({"role": "assistant", "content": msg["message"]})
        
        return recent_messages