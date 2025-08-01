# Conversation.py
import time
from typing import Dict, List, Optional, Union
from datetime import datetime
from utils.messages import SimpleChatMessage, ContentProgressStatus

class Conversation:
    """
    Manages the state, dialogue history, and content progression for a single user conversation.
    """
    def __init__(
        self, 
        user_id: str, 
        topic: str, # Main topic of the conversation
        general_system_prompt: str, # Overarching LLM instruction
        initial_messages: Optional[List[SimpleChatMessage]] = None,
        initial_level_content: Optional[str] = None,
        initial_progress_status: Optional[ContentProgressStatus] = None,
        initial_conversation_state: str = 'start' # e.g., 'start', 'in progress', 'end'
    ):
        self._cache_dirty = True
        self._cache: Dict[str, any] = {} # Cache for LLM contexts
        
        self.user_id = user_id
        self.topic = topic
        self.general_system_prompt = general_system_prompt
        
        # Dialogue history - stores SimpleChatMessage Pydantic instances
        self.messages: List[SimpleChatMessage] = initial_messages or []
        self.last_activity = time.time()
        self.max_messages = 20  # Keep last 20 messages in memory for context

        # Attributes for content progression and state
        self.current_level_content: Optional[str] = initial_level_content # The material for the current sub-prompt
        self.content_progress_status: ContentProgressStatus = initial_progress_status or ContentProgressStatus()
        self.conversation_state: str = initial_conversation_state # Overall state of the conversation

    def __repr__(self):
        dialogue = "\n".join(
            f"{msg.sender}: {msg.content} ({datetime.fromtimestamp(msg.timestamp)})"
            for msg in self.messages
        )
        return (
            f"Conversation(User: {self.user_id}, Topic: {self.topic}, State: {self.conversation_state})\n"
            f"Current Level Content: {self.current_level_content[:50]}...\n" if self.current_level_content else ""
            f"Progress: {self.content_progress_status.completion_percentage}%\n"
            f"Dialogue History:\n" + dialogue or "  No messages in conversation"
        )
    
    def set_conversation_state(self, new_state: str):
        """Updates the overall state of the conversation."""
        if self.conversation_state != new_state:
            print(f"🔄 Conversation state changed from '{self.conversation_state}' to '{new_state}'")
            self.conversation_state = new_state
            self.last_activity = time.time() # Mark activity on state change

    def set_current_level_content(self, content_material: str):
        """
        Sets the content material for the current sub-prompt/level.
        Resets progress status for the new content.
        """
        if self.current_level_content != content_material:
            print(f"📚 Current level content updated. Resetting progress.")
            self.current_level_content = content_material
            self.content_progress_status = ContentProgressStatus() # Reset progress for new content
            self._cache_dirty = True # Invalidate cache as context will change
            self.last_activity = time.time()

    async def add_message(self, content: str, sender: str):
        """Add message to conversation and maintain size limit."""
        print(f"📝 Added message from {sender}: {content}")
        # Ensure SimpleChatMessage is instantiated with keyword arguments
        message = SimpleChatMessage(content=content, sender=sender, timestamp=time.time())
        self.messages.append(message)
        self._cache_dirty = True # Invalidate cache
        self.last_activity = time.time()
        
        # Keep only recent messages in memory
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]

    def get_llm_chat_context(self, max_messages: int = 20) -> List[Dict[str, str]]:
        """
        Generates the context for the main LLM to respond to the user.
        Includes general system prompt, current level content, and recent chat history.
        """
        cache_key = f"llm_chat_context_{max_messages}_{self.current_level_content}"
        
        if not self._cache_dirty and cache_key in self._cache:
            return self._cache[cache_key]
        
        context: List[Dict[str, str]] = []
        
        # 1. General system prompt (always present)
        context.append({"role": "system", "content": self.general_system_prompt})

        # 2. Current level content (if set)
        if self.current_level_content:
            context.append({
                "role": "system", 
                "content": (
                    f"The student is currently learning about the following material: "
                    f"'{self.current_level_content}'. "
                    "Focus your responses on this material and guide the student through it."
                )
            })
        
        # 3. Recent chat messages
        # Make sure not to exceed max_messages, considering prepended system prompts
        num_messages_to_take = max_messages - len(context)
        recent_messages = self.messages[-num_messages_to_take:] if num_messages_to_take > 0 else []
        
        message_context = [
            {
                "role": "assistant" if msg.sender == "bot" else msg.sender, # Map 'bot' to 'assistant' for LLM
                "content": msg.content
            }
            for msg in recent_messages
        ]
        
        result = context + message_context
        
        self._cache[cache_key] = result
        self._cache_dirty = False
        
        return result
    
    def get_message_history_for_storage(self) -> List[SimpleChatMessage]:
        """
        Returns the raw list of SimpleChatMessage Pydantic objects for storage
        or for frontend initialization.
        """
        return self.messages

    def get_progress_estimation_context(self, max_recent_messages: int = 5) -> List[Dict[str, str]]:
        """
        Generates a focused context for an external LLM to estimate content progress.
        Includes the current level content and recent relevant dialogue.
        """
        if not self.current_level_content:
            return [] # No content to estimate progress on

        # You might want to filter messages more intelligently here
        # For now, just take the most recent messages that include user/bot dialogue
        recent_dialogue = [
            {"role": "user" if msg.sender == "user" else "assistant", "content": msg.content}
            for msg in self.messages if msg.sender in ["user", "bot"]
        ][-max_recent_messages:]

        context: List[Dict[str, str]] = [
            {
                "role": "system",
                "content": (
                    "You are an expert content progress monitor. "
                    "Analyze the provided 'Current Material' and the 'Recent Dialogue' "
                    "to determine how much of the material has been discussed. "
                    "Identify specific items from the 'Current Material' that have been covered. "
                    "Provide a JSON response with 'discussed_items' (list of strings), "
                    "'total_items' (list of strings from Current Material), and 'completion_percentage' (int)."
                )
            },
            {"role": "user", "content": f"Current Material: {self.current_level_content}\n\nRecent Dialogue: {recent_dialogue}"}
        ]
        return context

    def update_content_progress(self, progress_data: Dict[str, Union[int, List[str]]]):
        """
        Updates the content progress status based on the output from an estimation LLM.
        """
        try:
            # Validate and update the progress status using the Pydantic model
            self.content_progress_status = ContentProgressStatus(**progress_data)
            print(f"📊 Content progress updated: {self.content_progress_status.completion_percentage}% complete.")
            self.last_activity = time.time()
        except Exception as e:
            print(f"⚠️ Error updating content progress: {e}. Data received: {progress_data}")

    def get_completion_percentage(self) -> int:
        """Returns the current completion percentage for the level content."""
        return self.content_progress_status.completion_percentage

    def is_expired(self, timeout_seconds: int = 1800) -> bool:
        """Check if conversation has been inactive too long."""
        return time.time() - self.last_activity > timeout_seconds

    # --- Class Method for Loading from Raw Data (e.g., from Database) ---
    @classmethod
    def from_raw_data(
        cls, 
        user_id: str, 
        topic: str, 
        general_system_prompt: str,
        raw_messages: List[Dict[str, Union[str, float]]],
        current_level_content: Optional[str] = None,
        raw_progress_status: Optional[Dict[str, Union[int, List[str]]]] = None,
        conversation_state: str = 'start'
    ) -> 'Conversation':
        """
        Creates a Conversation instance from raw data, typically loaded from a database.
        Converts raw message dictionaries into SimpleChatMessage Pydantic models.
        """
        messages = []
        for msg_data in raw_messages:
            try:
                # Ensure correct mapping and handling of potentially missing fields
                messages.append(SimpleChatMessage(
                    content=msg_data.get('content', ''),
                    sender=msg_data.get('sender', msg_data.get('role', 'unknown')), # Handle 'role' if present
                    timestamp=msg_data.get('timestamp', time.time()) # Provide default if missing
                ))
            except Exception as e:
                print(f"⚠️ Warning: Could not parse message from raw data: {msg_data}. Error: {e}")
                # Optionally, skip or add a placeholder message

        progress_status = ContentProgressStatus(**raw_progress_status) if raw_progress_status else None

        return cls(
            user_id=user_id,
            topic=topic,
            general_system_prompt=general_system_prompt,
            initial_messages=messages,
            initial_level_content=current_level_content,
            initial_progress_status=progress_status,
            initial_conversation_state=conversation_state
        )