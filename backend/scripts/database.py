# scripts/database.py
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from utils.messages import SimpleChatMessage

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./chat_app.db")

# Create engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for database models
Base = declarative_base()

# Database Models
class LearningJourney(Base):
    __tablename__ = "learning_journeys"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    theme = Column(String, unique=True, index=True)
    objectives = Column(String, default="")
    prompt = Column(String, default="")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, index=True)
    theme = Column(String, default="default")
    message = Column(String)
    response = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    response_time_ms = Column(Integer)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, unique=True, index=True)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    message_count = Column(Integer, default=0)

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database operations class
class DatabaseManager:
    def __init__(self):
        create_tables()

    def register_theme(self, theme_name: str, objectives: str = "", prompt: str = ""):
        """Register a new theme in the database"""
        db = SessionLocal()
        try:
            # Check if theme already exists
            existing_theme = db.query(LearningJourney).filter(LearningJourney.theme == theme_name).first()
            if not existing_theme:
                new_theme = LearningJourney(theme=theme_name, objectives=objectives, prompt=prompt)
                db.add(new_theme)
                db.commit()
            return existing_theme or new_theme
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    def get_topics(self):
        """Get all registered themes from the database"""
        db = SessionLocal()
        try:
            themes = db.query(LearningJourney).all()
            return [theme.theme for theme in themes]
        finally:
            db.close()

    def register_user(self, user_id: str):
        """Register a new user in the database"""
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.user_id == user_id).first()
            if not user:
                user = User(user_id=user_id, message_count=0)
                db.add(user)
                db.commit()
            return user
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    async def save_chat_message(self, msg: dict):
        """Save a chat message to the database"""
        db = SessionLocal()
        print(f"Saving chat message: {msg}")
        try:
            message = ChatMessage(
                user_id=msg.get("user_id", "anonymous"),
                theme=msg.get("theme", "default"),
                message=msg["message"],
                response=msg.get("response", ""),
                response_time_ms=msg.get("response_time_ms", 0),
                timestamp=datetime.utcnow()
            )
            print(f"Saving chat message: {message}")
            db.add(message)
            
            # Update or create user
            user = db.query(User).filter(User.user_id == message.user_id).first()
            if user:
                user.last_seen = datetime.utcnow()
                user.message_count += 1
            else:
                user = User(user_id=message.user_id, message_count=1)
                db.add(user)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    def get_learning_journey_prompt(self, theme_name: str):
        """Get the prompt for a specific learning journey theme"""
        db = SessionLocal()
        try:
            theme = db.query(LearningJourney).filter(LearningJourney.theme == theme_name).first()
            if not theme:
                return ""
            return theme.prompt
        finally:
            db.close()

    def get_chat_history(self, user_id: str, theme: str, limit: int = 50):
        """Get chat history from database"""
        db = SessionLocal()
        try:
            query = db.query(ChatMessage)
            query = query.filter(ChatMessage.user_id == user_id, ChatMessage.theme == theme)
            

            if not query.count():
                print(f"No chat history found for user {user_id} with theme {theme}. Returning learning journey prompt.")
                return [SimpleChatMessage(content=self.get_learning_journey_prompt(theme), sender="system", timestamp=datetime.utcnow().timestamp())]
            
            messages = query.order_by(ChatMessage.timestamp.desc()).limit(limit).all()
            return self._format_chat_history(messages, theme)
        finally:
            db.close()
    
    def _format_chat_history(self, messages, theme: str):
        """Format chat messages into a list of dictionaries"""
        formatted = []
        formatted.append(SimpleChatMessage(
            content=self.get_learning_journey_prompt(theme), 
            sender="system", 
            timestamp=""
        ))
        for msg in reversed(messages):
            formatted.append(SimpleChatMessage(
                content=msg.message, 
                sender="user", 
                timestamp=msg.timestamp.timestamp()
            ))
            formatted.append(SimpleChatMessage(
                content=msg.response, 
                sender="bot", 
                timestamp=msg.timestamp.timestamp()
            ))
        return formatted

    def get_user_stats(self, user_id: str):
        """Get statistics for a specific user"""
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.user_id == user_id).first()
            if not user:
                return None
            
            return {
                "user_id": user.user_id,
                "first_seen": user.first_seen,
                "last_seen": user.last_seen,
                "message_count": user.message_count
            }
        finally:
            db.close()
    
    def get_overall_stats(self):
        """Get overall chat statistics"""
        db = SessionLocal()
        try:
            total_messages = db.query(ChatMessage).count()
            total_users = db.query(User).count()
            
            return {
                "total_messages": total_messages,
                "total_users": total_users
            }
        finally:
            db.close()
    
    def clear_all_data(self):
        """Clear all data from database"""
        db = SessionLocal()
        try:
            db.query(ChatMessage).delete()
            db.query(User).delete()
            db.commit()
        finally:
            db.close()