from pydantic import BaseModel
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class SimpleChatMessage:
    content: str
    sender: str  # "user" or "bot"
    timestamp: float

# Pydantic models for request/response
class UserRegistration(BaseModel):
    user_id: str
    classroom: Optional[str] = "null"

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = "anonymous"
    theme: Optional[str] = "default"

class ChatResponse(BaseModel):
    response: str
    timestamp: float
    response_time_ms: int

class TopicMessage(BaseModel):
    subject: str
    name: str
    instructions: str
    content: str

# Additional models you might need in the future
class HealthStatus(BaseModel):
    status: str
    timestamp: float
    version: str

class ChatStats(BaseModel):
    total_messages: int
    total_users: int
    total_topics: int
    uptime_seconds: float

class ChatHistory(BaseModel):
    messages: List[dict]
    total_count: int
    page: Optional[int] = 1
    limit: Optional[int] = 50