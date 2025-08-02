import time
from typing import List, Tuple

from ..core.managers.chatManager import ChatMemoryManager
from ..clients.chatbot import ChatBot
from utils.messages import ChatMessage, SimpleChatMessage

CHAT_OPERATION = {
    "INIT": "SYSTEM_INIT",
    "UPDATE": "SYSTEM_UPDATE",
    "PROGRESS": "SYSTEM_PROGRESS",
    "END": "SYSTEM_END",
}

class ChatService:
    """
    Handles the core business logic for chat operations, including message
    processing, context management, and conversation lifecycle.
    """
    def __init__(self, memory_manager: ChatMemoryManager, chatbot: ChatBot):
        """
        Initializes the ChatService with necessary dependencies.
        
        Args:
            memory_manager: An instance of ChatMemoryManager for stateful conversation management.
            chatbot: An instance of ChatBot for generating AI responses.
        """
        self.memory_manager = memory_manager
        self.chatbot = chatbot
        self.last_message: str = ""
        self.last_reply: str = ""

    async def get_or_create_conversation(self, user_id: str, topic: str) -> List[SimpleChatMessage]:
        """
        Loads chat history for a user and topic, or creates a new conversation
        if one does not exist.
        
        Args:
            user_id: The unique identifier for the user.
            topic: The topic of the conversation.
            
        Returns:
            A list of messages representing the conversation history.
        """
        try:
            # The memory manager handles the logic of fetching from DB or creating new
            conversation = await self.memory_manager.get_conversation(user_id, topic)
            
            # If the conversation is new and has no messages, generate a welcome message.
            if not conversation.messages:
                print(f"New conversation detected for user {user_id} on topic '{topic}'. Generating welcome message.")
                welcome_text = self.chatbot.generate_welcome_message(topic)
                await conversation.add_message(welcome_text, "bot")
                # Save the welcome message to the database
                await self.memory_manager.database.save_chat_message({
                    "user_id": user_id,
                    "theme": topic,
                    "message": CHAT_OPERATION["INIT"],
                    "response": welcome_text,
                    "response_time_ms": 0,
                })

            return conversation.get_message_history_for_storage()
        except Exception as e:
            print(f"❌ Failed to get or create conversation for user '{user_id}': {e}")
            raise

    async def process_user_message(self, user_id: str, theme: str, message: ChatMessage) -> Tuple[str, int]:
        """
        Processes a message from a user, generates a response, and persists the interaction.
        
        Args:
            user_id: The ID of the user sending the message.
            theme: The topic of the conversation.
            message: The ChatMessage object from the user.
            
        Returns:
            A tuple containing the bot's response string and the context length.
        """
        start_time = time.time()

        # Idempotency check to prevent duplicate processing
        if self.memory_manager.check_idempotency(user_id, theme, message.msg):
            print("🔁 Idempotent message detected, returning cached response.")
            return self.memory_manager.idempotency_response(user_id, theme)

        # Retrieve the conversation state
        conversation = await self.memory_manager.get_conversation(user_id, theme)
        await conversation.add_message(message.msg, sender="user")
        
        # Generate AI response
        context = conversation.get_llm_chat_context()
        response_text = self.chatbot.generate_response(context)
        
        # Persist the full interaction
        response_time_ms = int((time.time() - start_time) * 1000)
        await self.memory_manager.save_and_cache_message(user_id, theme, message, response_text, response_time_ms)
        
        print(f"🤖 Bot response to '{user_id}': {response_text}")
        return response_text, len(context)

    async def update_conversation_context(self, user_id: str, theme: str, sub_prompt: str) -> bool:
        """
        Updates the conversation's context based on a user action, like clicking an icon.
        
        Args:
            user_id: The ID of the user.
            theme: The topic of the conversation.
            sub_prompt: The new content or sub-prompt to focus on.
            
        Returns:
            True if the update was successful, False otherwise.
        """
        if self.last_message == sub_prompt:
            print(f"Idempotent update detected for user '{user_id}' on topic '{theme}'. Returning last reply.")
            return self.last_reply
        try:
            conversation = await self.memory_manager.get_conversation(user_id, theme)
            conversation.set_current_level_content(sub_prompt)
            print(f"Context updated for user '{user_id}' on topic '{theme}'.")
            update_text = self.chatbot.generate_update_message(sub_prompt)
            # Save the subtopic change to the database
            await self.memory_manager.database.save_chat_message({
                "user_id": user_id,
                "theme": theme,
                "message": CHAT_OPERATION["UPDATE"],
                "response": update_text,
                "response_time_ms": 0,
            })
            self.last_message = sub_prompt
            self.last_reply = update_text
            return update_text
        except Exception as e:
            print(f"❌ Error updating conversation context for user '{user_id}': {e}")
            return False
