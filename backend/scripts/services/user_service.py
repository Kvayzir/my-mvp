from ..clients.database import DatabaseManager

class UserService:
    """
    Handles all business logic related to users, such as registration
    and profile management.
    """
    def __init__(self, db_manager: DatabaseManager):
        """
        Initializes the UserService with a database manager.
        
        Args:
            db_manager: An instance of DatabaseManager for database operations.
        """
        self.db_manager = db_manager

    def register_user(self, user_id: str) -> None:
        """
        Registers a new user in the system.
        
        Args:
            user_id: The unique identifier for the user.
            
        Raises:
            ValueError: If the user_id is empty or whitespace.
        """
        if not user_id or not user_id.strip():
            raise ValueError("User ID cannot be empty")
        
        try:
            self.db_manager.register_user(user_id=user_id)
            print(f"User '{user_id}' registered successfully in the database.")
        except Exception as e:
            print(f"❌ Database registration failed for user '{user_id}': {e}")
            # Depending on requirements, you might want to re-raise or handle
            raise

