import time
import os
from typing import List, Dict, Any

from .services.user_service import UserService
from .services.topic_service import TopicService
from .services.chat_service import ChatService

from .clients.chatbot import ChatBot
from .core.managers.chatManager import ChatMemoryManager
from .clients.database import DatabaseManager

class AppService:
    """
    The main service layer for the application. It orchestrates all other
    services like user management, topic management, and chat sessions.
    """
    
    def __init__(self):
        """Initializes the main application service and its components."""
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")

        # 1. Initialize low-level managers
        self.db_manager = DatabaseManager()
        self.chatbot = ChatBot(dummy=False) # The AI Brain
        self.memory_manager = ChatMemoryManager(self.db_manager) # The Conversation State Manager

        # 2. Initialize high-level services with their dependencies
        self.user_service = UserService(self.db_manager)
        self.topic_service = TopicService(self.db_manager)
        self.chat_service = ChatService(self.memory_manager, self.chatbot)
    
    # --- System and Utility Methods ---

    def clear_local_chats(self):
        """Clears all conversation data from in-memory cache."""
        if self.memory_manager:
            self.memory_manager.clear_local_chats()

    def get_health_status(self) -> Dict[str, str]:
        """Provides a health check of the server and its connections."""
        api_status = "configured" if self.hf_token else "not configured"
        database_status = "enabled" if self.db_manager else "disabled"
        
        status_info = {
            "message": "Chat backend is running!", 
            "status": "healthy",
            "huggingface_api": api_status,
            "database": database_status
        }
        
        if self.db_manager:
            try:
                self.db_manager.get_overall_stats()
                status_info["database_connection"] = "healthy"
            except Exception as e:
                status_info["database_connection"] = f"error: {e}"
                status_info["status"] = "degraded"
        
        return status_info

