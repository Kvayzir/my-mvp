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

class ConversationUpdate(BaseModel):
    active_icon_content: str

class ChatMessage(BaseModel):
    id: int
    msg: str

class ChatHistoryLoad(BaseModel):
    msgList: list[SimpleChatMessage]

class ChatResponse(BaseModel):
    response: str
    timestamp: float
    response_time_ms: int
    complete: bool 

class TopicMessage(BaseModel):
    subject: str
    name: str
    instructions: str
    content: str

class ContentItem(BaseModel):
    level: int
    title: str
    icon: str
    color: str
    description: str
    material: Optional[str] = "En desarrollo"
    references: Optional[List[dict]] = None

class TopicContent(BaseModel):
    name: str
    description: str
    contents: List[ContentItem]

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