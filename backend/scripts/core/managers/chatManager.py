import time
from typing import Dict, Tuple, Callable
from ..models.conversation import Conversation
from ..models.topic import Topic
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

        # Forcing the general system prompt
        prompt = (
            f"Eres un asistente de profesor de educación secundaria cuyo objetivo es incentivar el aprendizaje de los estudiantes.\n"
            f"Para ello, tienes a tu disposición de material que ha preparado el docente para que compartas con los estudiantes. Este material ha sido segmentado para que los alumnos puedan visualizar el contenido en un mapa presente en la aplicación.\n" 
            f"Tu principal objetivo es lograr que los alumnos se interesen por aprender el material.\n"
            f"Tu modo de trabajo es el siguiente: basandote entéramente del material del docente, compartes un dato al alumno y le das una pregunta que le permita anticipar el siguiente dato del material, adapta tus respuestas y el contenido siguiente a compartir en base a la respuesta y el interés que demuestra el alumno."
            f"Recuerda ser breve en tus respuestas, no más de 5 oraciones, y no compartir más de un dato a la vez. "
            f"IMPORTANTE: No debes comentar información que no esté en el material del docente, y debes adaptar tus respuestas a la edad de los estudiantes de secundaria. "
            f"En el caso que ya no tengas más contenido, instruye al alumno a que utilize el mapa de la aplicación para pasar al siguiente tema que desee explorar."
            f"El tema de conversación de este chat es el siguiente: {theme}"
        )
        content = (
            f"Tu primera misión es introducir el tema en base a las temáticas disponibles: \n"
            f"- Un viaje microscópico a la célula\n"
            f"- La célula como una ciudad organizada\n"
            f"- Construyendo una base secreta inspirandonos de la célula\n"
            f"- La fascinante historia del núcleo\n"
            f"Presenta las opciones y pregunta al alumno cuál le gustaría explorar."
        )
        topic = Topic(
            name=theme,
            general_prompt=prompt,
            sub_content={
                "intro": content,
                "city": """"
                Hoy vamos a emprender un viaje increíble al mundo de lo microscópico, a las unidades fundamentales que nos forman: las células. Pero no las veamos solo como bolitas abstractas. ¡Imaginemos que cada célula es una mini ciudad bulliciosa! 🌃
                En esta ciudad celular, el núcleo es el ayuntamiento o la alcaldía. Es el centro de control, con su propia biblioteca de planos (los cromosomas) que contienen todas las instrucciones para que la ciudad funcione. Fuera del ayuntamiento, en las calles gelatinosas del 
                citoplasma, trabajan diligentemente los organelos, que son como las fábricas y servicios de la ciudad. Por ejemplo, las 
                mitocondrias son las centrales eléctricas de la ciudad, encargadas de producir la energía necesaria para todas las actividades. Los 
                ribosomas, por su parte, son como pequeñas fábricas de proteínas, los bloques de construcción de todo en la ciudad. Mientras tanto, el 
                citoesqueleto es como la red de carreteras y la estructura de los edificios, que le da forma a la ciudad y permite el movimiento de todo en su interior.
                ¿No les parece fascinante? Esta mini ciudad está trabajando sin parar en cada uno de nosotros. ¡Descubramos juntos los secretos que esconde cada una de sus partes!
                """,
                "nucleo": (
                    "Es una estructura esférica presente en todas las células eucariotas. En su interior se encuentra el material genético (ADN) que "
                    "contiene los genes, los cuales son los encargados de transmitir información de generación en generación. La función del núcleo" 
                    "es mantener la integridad de los genes y controlar las actividades celulares; por ello, se dice que es el centro de control de la" 
                    "célula. En el núcleo podemos encontrar diferentes estructuras: envoltura nuclear, nucléolo, nucleoplasma, poro nuclear, y cromatina."
                    ),
                "citoesqueleto": "Construyendo una base secreta inspirandonos de la célula",
                "energy": "La fascinante historia del núcleo"
            },
            objectives=[
                "Entender la estructura y función de la célula.",
                "Identificar las partes principales de una célula.",
                "Relacionar las funciones celulares con analogías cotidianas."
            ]
        )
        conversation = Conversation(user_id, topic=topic, initial_messages=recent_messages)
        conversation.set_current_level_content("intro")
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
