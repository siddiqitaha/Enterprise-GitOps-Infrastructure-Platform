# backend/app/schemas.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

class PriorityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: Optional[bool] = False
    priority: Optional[PriorityLevel] = PriorityLevel.MEDIUM
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)