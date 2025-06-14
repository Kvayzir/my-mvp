# scripts/database.py
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

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
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, index=True)
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
    
    def save_chat_message(self, user_id: str, message: str, response: str, response_time_ms: int):
        """Save a chat message to the database"""
        db = SessionLocal()
        try:
            # Save chat message
            chat_msg = ChatMessage(
                user_id=user_id,
                message=message,
                response=response,
                response_time_ms=response_time_ms
            )
            db.add(chat_msg)
            
            # Update or create user
            user = db.query(User).filter(User.user_id == user_id).first()
            if user:
                user.last_seen = datetime.utcnow()
                user.message_count += 1
            else:
                user = User(user_id=user_id, message_count=1)
                db.add(user)
            
            db.commit()
            return chat_msg.id
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    def get_chat_history(self, limit: int = 50, user_id: str = None):
        """Get chat history from database"""
        db = SessionLocal()
        try:
            query = db.query(ChatMessage)
            if user_id:
                query = query.filter(ChatMessage.user_id == user_id)
            
            messages = query.order_by(ChatMessage.timestamp.desc()).limit(limit).all()
            return [
                {
                    "id": msg.id,
                    "type": "user",
                    "message": msg.message,
                    "user_id": msg.user_id,
                    "timestamp": msg.timestamp.timestamp()
                }
                for msg in reversed(messages)  # Reverse to get chronological order
            ] + [
                {
                    "id": msg.id,
                    "type": "bot",
                    "message": msg.response,
                    "timestamp": msg.timestamp.timestamp()
                }
                for msg in reversed(messages)
            ]
        finally:
            db.close()
    
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