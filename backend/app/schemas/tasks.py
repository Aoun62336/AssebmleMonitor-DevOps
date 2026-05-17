from uuid import UUID
from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel

class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[date] = None
    assigned_to: Optional[UUID] = None

class TaskCreate(TaskBase):
    phase_id: UUID
    start_date: Optional[date] = None # Can be planned start date if provided

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    assigned_to: Optional[UUID] = None

class TaskResponse(TaskBase):
    id: UUID
    phase_id: UUID
    project_id: Optional[UUID] = None
    phase_name: Optional[str] = None
    assignee_name: Optional[str] = None
    status: str
    start_date: Optional[date] = None
    completed_date: Optional[date] = None
    is_delayed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
