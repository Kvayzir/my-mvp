"""
Server module handling chat operations, history management, and statistics.
"""
import time
import os
from typing import List, Dict, Any
from scripts.chatbot import ChatBot
from pydantic import BaseModel
from .database import DatabaseManager

class TopicMessage(BaseModel):
    topicSubject: str
    topicName: str
    topicInstructions: str
    topicContent: str

class ChatServer:
    """Manages chat sessions, history, and server operations."""
    
    def __init__(self, use_database: bool = True):
        """Initialize the chat server with empty history."""
        self.use_database = use_database
        self.chatbotsDict = {}
        self.topics = []
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")

        if self.use_database:
            self.db_manager = DatabaseManager()
            print("✅ Database initialized successfully")
        else:
            print("⚠️ Using in-memory storage (data will be lost on restart)")

    def register_user(self, user_id: str) -> None:
        """
        Register a new user in the chat system.
        
        Args:
            user_id: Unique identifier for the user
        """
        if not user_id.strip():
            raise ValueError("User ID cannot be empty")
        
        if self.use_database:
            # Register user in the database
            try:
                self.db_manager.save_chat_message(user_id=user_id, message="", response="", response_time_ms=0)
                print(f"User '{user_id}' registered successfully in the database")
            except Exception as e:
                print(f"❌ Database registration failed: {e}")
                return
            
        if user_id not in self.chatbotsDict:
            self.chatbotsDict[user_id] = ChatBot()
            print(f"User '{user_id}' registered successfully")
        else:
            print(f"User '{user_id}' already exists")
        
    def create_topic(self, topic: TopicMessage) -> None:
        """
        Create a new topic for the chatbot.
        
        Args:
            topic_name: Name of the topic to create
        """
        self.topics.append(topic)
        print(f"Topic '{topic.topicName}' created (not implemented in this example).")
    
    def process_message(self, message: str, user_id: str) -> str:
        """
        Process a user message and generate a response.
        
        Args:
            message: The user's message
            user_id: Unique identifier for the user
            chatbot: ChatBot instance to generate responses
            
        Returns:
            Generated response string
        """
        start_time = time.time()
        # Store user message in history
        user_entry = {
            "type": "user",
            "message": message,
            "user_id": user_id,
            "timestamp": start_time
        }
        
        # Generate response using chatbot
        self.chatbotsDict[user_id] = self.chatbotsDict.get(user_id, ChatBot())
        bot_response = self.chatbotsDict[user_id].generate_response(message, user_id, user_entry)
        
        # Calculate response time
        response_time_ms = int((time.time() - start_time) * 1000)

        # Save to database or memory
        if self.use_database:
            try:
                message_id = self.db_manager.save_chat_message(
                    user_id=user_id,
                    message=message,
                    response=bot_response,
                    response_time_ms=response_time_ms
                )
                print(f"💾 Saved message {message_id} to database")
            except Exception as e:
                print(f"❌ Database save failed: {e}")

        return bot_response
    
    def _get_recent_history_from_db(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent chat history from database for a specific user"""
        try:
            return self.db_manager.get_chat_history(limit=limit, user_id=user_id)
        except Exception as e:
            print(f"❌ Failed to get history from database: {e}")
            return []

    def get_chat_history(self, limit: int = 50, user_id: str = None) -> Dict[str, Any]:
        """
        Get recent chat history.
        
        Args:
            limit: Maximum number of messages to return
            
        Returns:
            Dictionary containing history and total message count
        """
        if self.use_database:
            try:
                history = self.db_manager.get_chat_history(limit=limit, user_id=user_id)
                return {
                    "history": history,
                    "total_messages": len(history),
                    "source": "database"
                }
            except Exception as e:
                print(f"❌ Failed to get history from database: {e}")
                return {
                    "history": [],
                    "total_messages": 0,
                    "error": str(e),
                    "source": "database_error"
                }
        return {
            "history": [self.chatbotsDict[user_id].get_chat_history(limit) for user_id in self.chatbotsDict], 
            "total_messages": 0
        }
    
    def clear_chat_history(self, user_id: str = "anonymus") -> Dict[str, str]:
        """
        Clear all chat history.
        
        Returns:
            Confirmation message
        """
        if self.use_database:
            try:
                self.db_manager.clear_all_data()
                return {
                    "message": "Database chat history cleared successfully",
                    "source": "database"
                }
            except Exception as e:
                return {
                    "message": f"Failed to clear database: {e}",
                    "source": "database_error"
                }
        self.chatbotsDict.get(user_id, ChatBot()).clear_chat_history()
        return {"message": "Chat history cleared"}
    
    def get_chat_stats(self, user_id: str = "anonymus") -> Dict[str, Any]:
        """
        Get comprehensive chat statistics.
        
        Returns:
            Dictionary containing various chat statistics
        """
        if self.use_database:
            try:
                db_stats = self.db_manager.get_overall_stats()
                return {
                    "total_messages": db_stats["total_messages"],
                    "total_users": db_stats["total_users"],
                    "llama_api_configured": self.hf_token is not None,
                    "database_enabled": True,
                    "source": "database"
                }
            except Exception as e:
                return {
                    "error": f"Database stats failed: {e}",
                    "llama_api_configured": self.hf_token is not None,
                    "database_enabled": True,
                    "database_error": True,
                    "source": "database_error"
                }
        return self.chatbotsDict.get(user_id, ChatBot()).get_stats()
    
    def get_health_status(self) -> Dict[str, str]:
        """
        Get server health status.
        
        Returns:
            Health status information
        """
        api_status = "configured" if self.hf_token else "not configured"
        database_status = "enabled" if self.use_database else "disabled"
        
        status_info = {
            "message": "Chat backend with Llama is running!", 
            "status": "healthy",
            "huggingface_api": api_status,
            "database": database_status
        }
        
        # Test database connection if enabled
        if self.use_database:
            try:
                self.db_manager.get_overall_stats()
                status_info["database_connection"] = "healthy"
            except Exception as e:
                status_info["database_connection"] = f"error: {e}"
                status_info["status"] = "degraded"
        
        return status_info
