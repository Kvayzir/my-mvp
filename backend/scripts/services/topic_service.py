from typing import List, Optional
from ..databases.database import DatabaseManager
from utils.messages import TopicMessage

class TopicService:
    """
    Handles all business logic related to topics, including creation,
    retrieval, and management.
    """
    def __init__(self, db_manager: DatabaseManager):
        """
        Initializes the TopicService with a database manager.
        
        Args:
            db_manager: An instance of DatabaseManager for database operations.
        """
        self.db_manager = db_manager

    def create_topic(self, topic: TopicMessage) -> None:
        """
        Creates a new topic and stores it in the database.
        
        Args:
            topic: A TopicMessage object containing the topic details.
        """
        try:
            self.db_manager.register_theme(
                theme_name=topic.name,
                objectives=topic.instructions,
                prompt=topic.content
            )
            print(f"Topic '{topic.name}' created successfully.")
        except Exception as e:
            print(f"❌ Error creating topic '{topic.name}': {e}")
            raise

    def get_topics(self, user_id: Optional[str] = None) -> List[str]:
        """
        Retrieves a list of topics.
        If a user_id is provided, it can be used to filter topics for that user.
        
        Args:
            user_id: (Optional) The ID of the user to filter topics for.
        
        Returns:
            A list of topic names.
        """
        # Note: The user_id parameter is included for future scalability.
        # Currently, it returns all topics regardless of the user.
        if user_id:
            print(f"Retrieving topics for user: {user_id} (currently returns all topics).")
        else:
            print("Retrieving all available topics.")
            
        try:
            return self.db_manager.get_topics()
        except Exception as e:
            print(f"❌ Failed to retrieve topics from database: {e}")
            raise

