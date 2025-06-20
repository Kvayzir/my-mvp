import time
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from utils.messages import SimpleChatMessage


class Conversation:
    def __init__(self, user_id: str, initial_messages: List[SimpleChatMessage] = None):
        self._cache_dirty = True
        self._cache = {}
        self.user_id = user_id
        self.messages: List[SimpleChatMessage] = initial_messages or []
        self.last_activity = time.time()
        self.max_messages = 20  # Keep last 20 messages in memory
    
    def add_message(self, content: str, sender: str):
        """Add message to conversation and maintain size limit"""
        message = SimpleChatMessage(content, sender, time.time())
        self.messages.append(message)
        self._cache_dirty = True
        self.last_activity = time.time()
        
        # Keep only recent messages in memory
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
    
    def get_context(self, max_messages: int = 10) -> List[Dict[str, str]]:
        """Optimized context retrieval with caching"""
        cache_key = f"context_{max_messages}"
        
        if not self._cache_dirty and cache_key in self._cache:
            return self._cache[cache_key]
        
        if not self.messages or max_messages <= 0:
            result = []
        else:
            recent_messages = self.messages[-max_messages:]
            result = [
                {
                    "role": "assistant" if msg.sender == "bot" else msg.sender,
                    "content": msg.content
                }
                for msg in recent_messages
            ]

        self._cache[cache_key] = result
        self._cache_dirty = False
        
        return result
    
    def is_expired(self, timeout_seconds: int = 1800) -> bool:
        """Check if conversation has been inactive too long"""
        return time.time() - self.last_activity > timeout_seconds

class ChatMemoryManager:
    def __init__(self, database, max_memory_conversations: int = 1000):
        self.database = database
        self.active_conversations: Dict[Tuple[str, str], Conversation] = {}
        self.max_memory_conversations = max_memory_conversations
        self.conversation_timeout = 1800  # 30 minutes
    
    async def get_conversation(self, user_id: str, theme: str) -> Conversation:
        """Get or create conversation with database fallback"""
        
        # Check if already in memory
        if (user_id, theme) in self.active_conversations:
            conversation = self.active_conversations[(user_id, theme)]
            conversation.last_activity = time.time()  # Update activity
            return conversation
        
        # Load from database
        recent_messages = await self.database.get_chat_history(user_id, theme, limit=20)
        print(f"Loaded {len(recent_messages)} messages from database for user {user_id} and theme {theme}")
        conversation = Conversation(user_id, recent_messages)
        
        # Add to memory (with cleanup if needed)
        await self._add_to_memory(user_id, theme, conversation)
        return conversation
    
    async def save_and_cache_message(self, user_id: str, content: str, sender: str):
        """Save message to database and update memory cache"""
        
        # Save to database first (WIP)
        await self.database.save_chat_message(user_id, content, sender, 500)
        
        # Update memory cache
        conversation = await self.get_conversation(user_id)
        conversation.add_message(content, sender)
    
    async def _add_to_memory(self, user_id: str, theme: str, conversation: Conversation):
        """Add conversation to memory with cleanup"""
        
        # Clean up expired conversations first
        await self._cleanup_expired_conversations()
        
        # If still at limit, remove oldest conversation
        if len(self.active_conversations) >= self.max_memory_conversations:
            oldest_user = min(
                self.active_conversations.keys(),
                key=lambda u: self.active_conversations[u].last_activity
            )
            del self.active_conversations[oldest_user]
        
        self.active_conversations[(user_id, theme)] = conversation
    
    async def _cleanup_expired_conversations(self):
        """Remove expired conversations from memory"""
        expired_users = [
            user_id for user_id, conv in self.active_conversations.items()
            if conv.is_expired(self.conversation_timeout)
        ]
        
        for user_id in expired_users:
            del self.active_conversations[user_id]
    
    async def force_reload_from_db(self, user_id: str) -> Conversation:
        """Force reload conversation from database (useful for debugging)"""
        if user_id in self.active_conversations:
            del self.active_conversations[user_id]
        return await self.get_conversation(user_id)
    
    def get_memory_stats(self) -> dict:
        """Get statistics about memory usage"""
        return {
            "active_conversations": len(self.active_conversations),
            "memory_limit": self.max_memory_conversations,
            "timeout_seconds": self.conversation_timeout,
            "memory_usage_percent": (len(self.active_conversations) / self.max_memory_conversations) * 100
        }
