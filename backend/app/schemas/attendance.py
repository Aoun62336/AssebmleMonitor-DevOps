from uuid import UUID
from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel

class AttendanceCheckIn(BaseModel):
    project_id: UUID
    notes: Optional[str] = None

class AttendanceCheckOut(BaseModel):
    project_id: UUID
    notes: Optional[str] = None

class AttendanceCreate(BaseModel):
    user_id: UUID
    project_id: UUID
    attendance_date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: str = "present"
    notes: Optional[str] = None

class AttendanceUpdate(BaseModel):
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class AttendanceResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_name: Optional[str] = None
    project_id: UUID
    attendance_date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: str
    notes: Optional[str] = None
    total_hours: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
