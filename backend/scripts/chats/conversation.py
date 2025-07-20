import time
from typing import Dict, List, Optional
from datetime import datetime
from utils.messages import SimpleChatMessage


class Conversation:
    """
    Manages the state and logic of a single user conversation.
    """
    def __init__(self, user_id: str, initial_messages: List[SimpleChatMessage] = None):
        self._cache_dirty = True
        self._cache = {}
        self.user_id = user_id
        self.messages: List[SimpleChatMessage] = initial_messages or []
        self.last_activity = time.time()
        self.max_messages = 20  # Keep last 20 messages in memory
        self.active_icon_content: Optional[str] = None # To store the content of the last clicked icon
        self.default_system_prompt = "You are a helpful AI assistant for a high school student. Your goal is to help them with their assignment. Start by greeting the student and asking how you can help with their notebook."


    def __repr__(self):
        dialogue = "\n".join(
            f"{msg.sender}: {msg.content} ({datetime.fromtimestamp(msg.timestamp)})"
            for msg in self.messages
        )
        return f"Dialogue History of {self.user_id}\n" + dialogue or "No messages in conversation"
    
    def handle_icon_click(self, icon_content: str):
        """
        Sets the active topic for the conversation based on an icon click.
        This content will be prepended to the context sent to the LLM.
        """
        self.active_icon_content = icon_content
        self._cache_dirty = True # Invalidate cache
        self.last_activity = time.time()
        # Add a system message to mark the change of context for the user.
        self.add_message(f"Now focusing on: {icon_content}", "system")

    async def add_message(self, content: str, sender: str):
        """Add message to conversation and maintain size limit"""
        print(f"📝 Added message from {sender}: {content}")
        message = SimpleChatMessage(content, sender, time.time())
        self.messages.append(message)
        self._cache_dirty = True
        self.last_activity = time.time()
        # Keep only recent messages in memory
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
    
    def get_context(self, max_messages: int = 20) -> List[Dict[str, str]]:
        """Optimized context retrieval with caching, including active icon context and a default prompt."""
        cache_key = f"context_{max_messages}_{self.active_icon_content}"
        
        if not self._cache_dirty and cache_key in self._cache:
            return self._cache[cache_key]
        
        context = []
        # If an icon has been clicked, its content becomes the primary system prompt
        if self.active_icon_content:
            system_prompt = (
                "The user has selected a new topic by clicking an icon. "
                f"Your next response should be based *solely* on the following content: '{self.active_icon_content}'. "
                "Engage the user on this new topic."
            )
            context.append({"role": "system", "content": system_prompt})
        # If it's a new conversation with no messages and no icon click, use the default prompt
        elif not self.messages:
            context.append({"role": "system", "content": self.default_system_prompt})

        # Make sure not to exceed max_messages, including the prepended context
        num_messages_to_take = max_messages - len(context)
        recent_messages = self.messages[-num_messages_to_take:] if num_messages_to_take > 0 else []
        
        message_context = [
            {
                "role": "assistant" if msg.sender == "bot" else msg.sender,
                "content": msg.content
            }
            for msg in recent_messages
        ]
        # Prepend the system context to the message history
        result = context + message_context

        self._cache[cache_key] = result
        self._cache_dirty = False
        
        return result
    
    def is_expired(self, timeout_seconds: int = 1800) -> bool:
        """Check if conversation has been inactive too long"""
        return time.time() - self.last_activity > timeout_seconds
