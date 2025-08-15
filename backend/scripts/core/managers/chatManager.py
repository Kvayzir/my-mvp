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
        content = (
            "Tu primera misión es introducir el tema en base a las temáticas disponibles: \n"
            "- Un viaje microscópico a la célula\n"
            "- La célula como una ciudad organizada\n"
            "- La misión para descubrir del núcleo\n"
            "Presenta las opciones y pregunta al alumno cuál le gustaría explorar."
            "Una vez que el alumno elija, instruye al alumno a hacer clic en el icono correspondiente para comenzar el viaje.\n\n"
        )
        topic = Topic(
            name=theme,
            theme="Partes de la célula",
            sub_content={
                "intro": content,
                "mission": (
                    "¡Atención, agente! 🕵️‍♂️ Tu próxima misión te lleva al lugar más importante del universo... ¡dentro de una célula!"
                    "El núcleo  es el centro de control, una especie de cuartel general que guarda los planos y toda la información crucial."
                    "Tu objetivo es entender por qué este 'cerebro' celular es tan vital."
                    "Para lograrlo, tenemos algunas pistas clave. El núcleo está protegido por una membrana que actúa como un muro, pero tiene poros que funcionan como puntos de control para que algunas moléculas, como el ARN, puedan entrar y salir."
                    "¿Listo para empezar tu misión? 🤔"
                ),
                "city": (
                    "¿Alguna vez te has preguntado cómo funciona una ciudad? Tiene un ayuntamiento que la controla, una red de transporte que mueve personas y mercancías, y plantas de energía que la mantienen activa."
                    "¡Pues tu cuerpo tiene miles de millones de ciudades diminutas llamadas células que funcionan de una forma muy similar! "
                    "En este viaje, exploraremos cómo cada parte de la célula, desde el núcleo hasta las mitocondrias, cumple una función vital para mantener el orden y la vida. "
                    "Te invitamos a descubrir los 'edificios' y los 'sistemas de gobierno' de esta increíble ciudad microscópica."
                ),
                "travel": (
                    "Prepárate para un viaje increíble, ¡uno que te llevará al interior de la vida misma! En lugar de viajar a otro país, nos aventuraremos en el universo microscópico de la célula. "
                    "Descubriremos que en su centro se esconde un 'cerebro' llamado núcleo, que guarda un tesoro muy valioso: el material genético. "
                    "También conoceremos a los 'obreros' que construyen proteínas y a los 'guardianes' que protegen la célula de peligros. "
                    "A lo largo de esta aventura, desvelaremos cómo estos pequeños componentes trabajan juntos para dar vida a los organismos, ¡incluyéndote a ti!"
                ),
                "nucleo": (
                    "El núcleo es una estructura esférica presente en todas las células eucariotas y es considerado el centro de control de la célula."
                    "Su función es mantener la integridad de los genes y controlar las actividades celulares. " 
                    "Dentro del núcleo se encuentra el material genético (ADN) en forma de genes, que transmiten la información de generación en generación." 
                    "El núcleo está compuesto por varias estructuras:"
                    "- Envoltura nuclear o carioteca: Una doble membrana con poros que regula el paso de moléculas entre el núcleo y el citoplasma. La membrana externa tiene ribosomas adheridos."
                    "- Nucléolo: Una estructura granulosa donde se sintetizan y ensamblan los ribosomas. Normalmente, hay entre uno a cinco nucléolos por célula."
                    "- Nucleoplasma: Un material de consistencia gelatinosa compuesto por agua, sales y proteínas."
                    "- Cromatina: Filamentos de ADN y proteínas. Durante la división celular, se compacta para formar los cromosomas."
                    "- Poro nuclear. Es una válvula formada por proteínas, que selecciona lo que entra y lo que sale del núcleo."
                    ),
                "citoesqueleto": (
                    "El citoplasma de las células eucariotas contiene una red de tubos y filamentos de proteínas que conforman el citoesqueleto."
                    "Su función principal es dar forma y resistencia mecánica a la célula. También participa en el movimiento celular, sostiene los orgánulos y permite que se movilicen, e interviene en la división celular."
                    "El citoesqueleto está formado por tres tipos de fibras:"
                    "- Microfilamentos: Compuestos por moléculas de actina, su longitud aumenta y disminuye continuamente."
                    "- Filamentos intermedios: Son estables y proporcionan soporte a la membrana celular."
                    "- Microtúbulos: Son estructuras huecas de tubulina que modifican la forma de la célula y redistribuyen los orgánulos."
                ),
                "energia": (
                    "La mitocondria es el organelo encargado de abastecer de energía a la célula."
                    "A través de la respiración celular, utiliza la glucosa para sintetizar moléculas de ATP, las cuales almacenan grandes cantidades de energía."
                    "La mitocondria posee una membrana externa y una membrana interna, entre las cuales hay un espacio intermembrana. La membrana interna se pliega formando las crestas, y dentro de esta se encuentra la matriz mitocondrial."
                    "La mitocondria también contiene su propio ADN y ribosomas."
                    "El cloroplasto es otro organelo energético, aunque es exclusivo de las células vegetales. Contiene clorofila, un pigmento que participa en la fotosíntesis"
                ),
                "organelos": (
                    "Estos orgánulos se encargan de crear, modificar o transportar diversas sustancias dentro de la célula:"
                    "- Retículo endoplasmático rugoso (RER): Es una extensión de la membrana nuclear y se caracteriza por tener ribosomas adheridos, lo que le da una apariencia rugosa. Su función principal es la síntesis y el transporte de proteínas."
                    "- Retículo endoplasmático liso (REL): Similar al RER pero sin ribosomas. Su función es la síntesis de lípidos y la desintoxicación celular de sustancias como drogas o pesticidas."
                    "- Aparato de Golgi: Un conjunto de bolsas membranosas planas que empaquetan las proteínas para que puedan ser secretadas al exterior de la célula."
                    "- Ribosoma: Estructura compuesta por ARN ribosomal y proteínas. Su función principal es la síntesis de proteínas."
                    "- Vacuola: Es una vesícula con una membrana y un interior predominantemente acuoso. En las células animales suelen ser pequeñas y se les llama vesículas. En las células vegetales son muy grandes y acumulan agua, reservas o desechos."
                    "- Lisosoma: Es una vesícula que contiene enzimas digestivas que digieren la materia orgánica. La digestión puede ser extracelular (cuando vierten las enzimas al exterior) o intracelular (cuando se unen a una vacuola que contiene la materia a digerir)."
                )
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
