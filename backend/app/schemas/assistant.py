from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class GroundedReference(BaseModel):
    opportunity_id: int
    title: str
    organization: str
    category: str
    deadline: Optional[datetime] = None
    match_score: Optional[float] = None
    official_url: str

class ChatMessage(BaseModel):
    role: str  # "user", "assistant", "system"
    content: str
    timestamp: datetime = datetime.utcnow()
    references: Optional[List[GroundedReference]] = []

class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class AIChatResponse(BaseModel):
    response: str
    intent: Optional[str] = "general_query"
    references: List[GroundedReference] = []
    agent_steps: List[str] = []
    suggested_followups: List[str] = []

