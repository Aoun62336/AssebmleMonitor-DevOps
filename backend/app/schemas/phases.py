from uuid import UUID
from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel

class PhaseBase(BaseModel):
    name: str
    description: Optional[str] = None
    order_index: int = 0
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class PhaseCreate(PhaseBase):
    project_id: UUID

class PhaseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    # STRICT RULE: status is not manually editable here

class PhaseResponse(PhaseBase):
    id: UUID
    project_id: UUID
    project_name: Optional[str] = None
    status: str
    progress_pct: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
