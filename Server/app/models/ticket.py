from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TicketSeverity(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in-progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class Comment(BaseModel):
    author_id: str
    author_name: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TicketBase(BaseModel):
    title: str
    description: str
    severity: TicketSeverity
    status: TicketStatus = TicketStatus.OPEN
    department: Optional[str] = None

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[TicketSeverity] = None
    status: Optional[TicketStatus] = None
    department: Optional[str] = None
    assigned_to: Optional[str] = None

class Ticket(TicketBase):
    id: str = Field(..., alias="_id")
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    assigned_to: Optional[str] = None
    comments: List[Comment] = []
