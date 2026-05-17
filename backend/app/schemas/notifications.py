from uuid import UUID
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class NotificationCreate(BaseModel):
    user_id: UUID
    title: str
    message: Optional[str] = None
    type: str = "info"
    link: Optional[str] = None


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: Optional[str] = None
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
