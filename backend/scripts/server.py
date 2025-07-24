"""
Server module handling chat operations, history management, and statistics.
"""
import time
import os
from typing import List, Dict, Any
from scripts.chats.chatbot import ChatBot
from utils.messages import UserRegistration, TopicMessage, ChatMessage, ChatResponse
from .databases.database import DatabaseManager
from .chats.chatManager import ChatMemoryManager

class ChatServer:
    """Manages chat sessions, history, and server operations."""
    
    def __init__(self, use_database: bool = True):
        """Initialize the chat server with empty history."""
        self.use_database = use_database
        self.topics = []
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")
        self.chatBot = ChatBot(dummy=True)

        if self.use_database:
            self.db_manager = DatabaseManager()
            self.memory_manager = ChatMemoryManager(self.db_manager)
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
            try:
                self.db_manager.register_user(user_id=user_id)
                print(f"User '{user_id}' registered successfully in the database")
            except Exception as e:
                print(f"❌ Database registration failed: {e}")
                return
        
    def create_topic(self, topic: TopicMessage) -> None:
        """
        Create a new topic for the chatbot.
        
        Args:
            topic_name: Name of the topic to create
        """
        self.topics.append(topic)
        self.db_manager.register_theme(
            theme_name=topic.name,
            objectives=topic.instructions,
            prompt=topic.content
        )
        print(f"Topic '{topic.name}' created (not implemented in this example).")

    def get_topics(self, user_id=None) -> TopicMessage:
        """
        Retrieve all topics available in the chat system.
        """
        if user_id is None:
            return self.db_manager.get_topics()
        return self.db_manager.get_topics()

    def load_chat(self, user_id: str, topic: str) -> List[Dict[str, Any]]:
        """
        Load chat history for a specific user and topic.
        
        Args:
            user_id: Unique identifier for the user
            topic: Topic of the chat
            
        Returns:
            List of messages in the chat history
        """
        if self.use_database:
            try:
                return self.db_manager.get_chat_history(user_id=user_id, theme=topic)
            except Exception as e:
                print(f"❌ Failed to load chat history from database: {e}")
                return []
        else:
            # Fallback to in-memory storage
            return self.memory_manager.get_conversation(user_id, topic).get_context()

    async def patch_conversation(self, user_id: str, theme: str, icon_content: str) -> None:
        """
        Update the conversation state based on an icon click.
        
        Args:
            user_id: Unique identifier for the user
            theme: Topic of the conversation
            icon_content: Content associated with the clicked icon
        """
        try:
            conversation = await self.memory_manager.get_conversation(user_id, theme)
            conversation.handle_icon_click(icon_content)
            print(f"Updated conversation for user {user_id} with theme {theme} to focus on: {icon_content}")
            return True
        except Exception as e:
            print(f"❌ Error updating conversation: {e}")
            return False

    async def process_message(self, user_id: str, theme: str, message: ChatMessage) -> str:
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
        try:
            is_idempotent = self.memory_manager.check_idempotency(user_id, theme, message.msg)
        except Exception as e:
            print(f"❌ Error checking idempotency: {e}")
            is_idempotent = False
        if is_idempotent:
            print("🔁 Idempotent message detected, skipping processing")
            return self.memory_manager.idempotency_response(user_id, theme)
        # Get conversation context from memory
        conversation = await self.memory_manager.get_conversation(user_id, theme)
        await conversation.add_message(message.msg, sender="user")
        # Generate response (your AI logic here)
        response = self.chatBot.generate_response(conversation.get_context())
        
        # Save message 
        await self.memory_manager.save_and_cache_message(user_id, theme, message, response, time.time() - start_time)
        print(f"🤖 Bot response: {response}")
        return response
        
    def _get_recent_history_from_db(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent chat history from database for a specific user"""
        try:
            return self.db_manager.get_chat_history(limit=limit, user_id=user_id)
        except Exception as e:
            print(f"❌ Failed to get history from database: {e}")
            return []

    def get_chat_history(self, user_id: str, theme: str, limit: int = 50) -> Dict[str, Any]:
        """
        Get recent chat history.
        
        Args:
            limit: Maximum number of messages to return
            
        Returns:
            Dictionary containing history and total message count
        """
        if self.use_database:
            try:
                history = self.db_manager.get_chat_history(user_id=user_id, theme=theme, limit=limit)
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
    
    def clear_local_chats(self):
        self.memory_manager.clear_local_chats()
    
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
