from typing import Dict, Optional, List

class Topic:
    """
    Represents a single assignment topic, containing all the necessary
    prompts and content for guiding a student.
    """
    def __init__(
        self,
        name: str,
        theme: str,
        sub_content: Dict[str, str],
        objectives: Optional[List[str]] = None
    ):
        """
        Initializes a Topic object.
        
        Args:
            name: The unique name of the topic (e.g., "Literary Analysis Essay").
            theme: The main theme that the LLM will discuss.
            sub_content: A dictionary where keys are icon IDs (or sub-topic names)
                         and values are the specific content for that section.
            objectives: (Optional) A list of learning objectives for this topic.
        """
        self.name = name
        self.theme = theme
        self.sub_content = sub_content
        self.objectives = objectives or []

    def __repr__(self):
        return (
            f"Topic(name='{self.name}', "
            f"sub_content_keys={list(self.sub_content.keys())})"
        )

    def get_general_prompt(self, sub_content_key) -> str:
        """
        Returns the general system prompt for this topic.
        """
        general_prompt = (
            "Eres un guía de aprendizaje para estudiantes de secundaria, especializado en motivarlos a explorar el material educativo. "
            "Tu objetivo es hacer que el aprendizaje sea un 'viaje' interesante y personalizado.\n\n"
            "Tu trabajo se centra en el material que el docente ha preparado. Siempre que interactúes con un estudiante, debes seguir estas reglas clave:\n"
            "1. **Mantente dentro del material**: Solo puedes usar la información proporcionada por el docente, indicada por la variable de contexto section_content. Nunca inventes o añadas datos externos. Si el estudiante pregunta algo fuera del material, responde amablemente que esa información no está disponible en la sección actual y anímalo a continuar con el 'viaje de aprendizaje'.\n"
            "2. **Actúa como un guía, no un expositor**: Tu rol no es dar la respuesta completa, sino dar pistas, hacer preguntas y motivar la curiosidad. La idea es que el estudiante anticipe y explore el siguiente dato por sí mismo.\n"
            "3. **Adopta un tono juvenil y amigable**: Utiliza un lenguaje cercano y relevante para estudiantes de secundaria. Usa analogías o metáforas para que el material sea más fácil de entender y divertido.\n"
            "4. **Respuestas concisas**: Mantén tus respuestas breves, idealmente entre **2 y 4 oraciones**. Solo comparte un dato a la vez.\n"
            "5. **Ciclo de interacción**: La interacción debe seguir un ciclo simple: Pista -> Pregunta -> Adaptación.\n"
            "6. **Gestión de la sección**: Introduce el tema de la sección usando la metáfora elegida. Limítate estrictamente a los contenidos de la sección actual, sin profundizar. Cuando el material de la sección se acabe, instruye al estudiante para que use el mapa de la aplicación para seleccionar un nuevo tema.\n\n"
            "**Variable de Contexto**:\n\n"
            f"**{{theme}}**: {self.theme}\n"
            f"**{{section}}**: {sub_content_key}\n"
            f"**{{section_content}}**: {self.sub_content.get(sub_content_key)}\n\n"
        )
        return general_prompt

    def get_sub_content(self, sub_content_key: str) -> Optional[str]:
        """
        Retrieves the specific content material for a given sub-topic key.
        This is the content that will be passed to the Conversation object.
        
        Args:
            sub_content_key: The key corresponding to the icon/sub-topic clicked by the user.
            
        Returns:
            The content string if the key exists, otherwise None.
        """
        return self.sub_content.get(sub_content_key)

    def get_formatted_general_prompt(self) -> str:
        """
        Returns the general system prompt, potentially formatted with objectives.
        """
        if self.objectives:
            objectives_str = "\n".join(f"- {obj}" for obj in self.objectives)
            return (
                f"{self.general_prompt}\n\n"
                f"The key learning objectives for this topic are:\n{objectives_str}"
            )
        return self.general_prompt
