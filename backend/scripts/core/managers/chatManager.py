import time
from typing import Dict, Tuple, Callable
from ..models.conversation import Conversation
from utils.messages import ChatMessage


class ChatMemoryManager:
    """
    Manages multiple active conversations, handling their creation, retrieval,
    and storage.
    """
    def __init__(self, database, max_memory_conversations: int = 1000):
        self.database = database
        self.active_conversations: Dict[Tuple[str, str], Conversation] = {}
        self.max_memory_conversations = max_memory_conversations
        self.conversation_timeout = 1800  # 30 minutes

    def clear_local_chats(self):
        """Clear all active conversations in memory"""
        print("Clearing all active conversations in memory")
        self.active_conversations = {}

    def check_idempotency(self, user_id: str, theme: str, msg: str) -> bool:
        """Check if message already replied"""
        if (user_id, theme) in self.active_conversations:
            conversation = self.active_conversations[(user_id, theme)]
            if conversation.get_llm_chat_context()[-2]["content"] == msg:
                return True
        return False
    
    def idempotency_response(self, user_id: str, theme: str):
        cache_context = self.active_conversations[(user_id, theme)].get_llm_chat_context()
        return cache_context[-1]["content"], len(cache_context)

    async def create_new_conversation(self, user_id: str, theme: str, getBotReply: Callable[[str], str]) -> Conversation:
        """Create a new conversation or return existing one"""
        if (user_id, theme) in self.active_conversations:
            print(f"🔍 Found existing conversation for user {user_id} with theme {theme}")
            context = self.active_conversations[(user_id, theme)].get_message_history_for_storage()
            return context
        
        conversation = Conversation(user_id, topic=theme, general_system_prompt="Starting new conversation on topic: " + theme)
        bot_response = getBotReply("Starting new conversation on topic: " + theme)
        print(f"🤖 Bot response: {bot_response}")
        await conversation.add_message(bot_response, "bot")
        await self._add_to_memory(user_id, theme, conversation)
        context = conversation.get_message_history_for_storage()
        return context
    
    async def get_conversation(self, user_id: str, theme: str) -> Conversation:
        """Get or create conversation with database fallback"""
        # Check if already in memory
        if (user_id, theme) in self.active_conversations:
            print(f"🔍 Found conversation in memory for user {user_id} with theme {theme}")
            conversation = self.active_conversations[(user_id, theme)]
            conversation.last_activity = time.time()  # Update activity
            return conversation
        
        # Load from database
        recent_messages = self.database.get_chat_history(user_id, theme, limit=20)
        print(recent_messages)
        conversation = Conversation(user_id, topic=theme, general_system_prompt="Starting new conversation on topic: " + theme, initial_messages=recent_messages)
        
        # Add to memory (with cleanup if needed)
        await self._add_to_memory(user_id, theme, conversation)
        return conversation
    
    async def save_and_cache_message(self, user_id: str, theme: str, msg: ChatMessage, response: str, response_time_ms: int):
        """Save message to database and update memory cache"""
        
        # Save to database first (WIP)
        message = {
            "user_id": user_id or "anonymous",
            "theme": theme or "default",
            "message": msg.msg,
            "response": response,
            "response_time_ms": response_time_ms,
        }
        await self.database.save_chat_message(message)
        print("💾 Saved message to database")
        # Update memory cache
        try:
            await self.active_conversations[(user_id, theme)].add_message(response, "bot")
        except KeyError:
            print(f"❌ No active conversation found for user {msg.user_id} with theme")
        except Exception as e:
            print(f"❌ Error updating memory cache: {e}")
    
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
        print(f"🗃️ Added conversation for user {user_id} with theme {theme} to memory")
    
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
