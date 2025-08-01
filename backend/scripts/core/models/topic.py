from typing import Dict, Optional, List

class Topic:
    """
    Represents a single assignment topic, containing all the necessary
    prompts and content for guiding a student.
    """
    def __init__(
        self,
        name: str,
        general_prompt: str,
        sub_content: Dict[str, str],
        objectives: Optional[List[str]] = None
    ):
        """
        Initializes a Topic object.
        
        Args:
            name: The unique name of the topic (e.g., "Literary Analysis Essay").
            general_prompt: The main system prompt for the LLM for this topic.
            sub_content: A dictionary where keys are icon IDs (or sub-topic names)
                         and values are the specific content for that section.
            objectives: (Optional) A list of learning objectives for this topic.
        """
        self.name = name
        self.general_prompt = general_prompt
        self.sub_content = sub_content
        self.objectives = objectives or []

    def __repr__(self):
        return (
            f"Topic(name='{self.name}', "
            f"sub_content_keys={list(self.sub_content.keys())})"
        )

    def get_prompt_for_sub_content(self, sub_content_key: str) -> Optional[str]:
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
