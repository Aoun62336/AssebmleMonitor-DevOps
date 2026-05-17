from uuid import UUID
from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    status: str = "planning"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None

class ProjectAssignmentBase(BaseModel):
    user_id: UUID
    role: str

class ProjectAssignmentCreate(ProjectAssignmentBase):
    pass

class ProjectAssignmentResponse(ProjectAssignmentBase):
    id: UUID
    project_id: UUID
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectResponse(ProjectBase):
    id: UUID
    manager_id: Optional[UUID] = None
    manager_name: Optional[str] = None
    assignments: List[ProjectAssignmentResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
