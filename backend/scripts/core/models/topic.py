from typing import Dict, Optional, List
from scripts.clients.mockup_database import TopicInformation, MaterialInfo

class Topic2LLM:
    """
    Represents a single assignment topic, containing all the necessary
    prompts and content for guiding a student.
    """
    def __init__(
        self,
        topicInfo: TopicInformation,
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
        self.topicInfo = topicInfo
        self.objectives = objectives or []

    def __repr__(self):
        return (
            f"Topic(name='{self.topicInfo.name}', "
            f"sub_content_keys={[c.title for c in self.topicInfo.contents]})"
        )

    def get_general_prompt(self, sub_content_key) -> str:
        """
        Returns the general system prompt for this topic.
        """
        sub_content = self.get_sub_content(sub_content_key)
        if not sub_content:
            raise ValueError(f"Sub-content key '{sub_content_key}' not found in topic '{self.topicInfo.name}'.")
        
        try:
            with open('scripts/core/models/general_prompt.md', 'r', encoding='utf-8') as f:
                plantilla_prompt = f.read()
        except FileNotFoundError:
            print("Error: El archivo 'general_prompt.md' no fue encontrado.")
            exit()
        general_prompt = plantilla_prompt.format(
            theme=self.topicInfo.name,
            section=sub_content_key,
            section_content=sub_content
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
        content = list(filter(lambda c: c.title == sub_content_key, self.topicInfo.contents))
        if not content:
            print(f"⚠️ Warning: Sub-content key '{sub_content_key}' not found in topic '{self.topicInfo.name}'.")
            return None
        contentList = [f'{p.keyword}: {p.content}' for p in content[0].checklist]
        acc = ''
        for index, c in enumerate(contentList):
            acc += f'{index}. ' + c + '\n'
        return acc

