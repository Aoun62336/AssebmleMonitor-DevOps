from uuid import UUID
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class SitePhotoBase(BaseModel):
    caption: Optional[str] = None
    category: str = "general"

class SitePhotoResponse(SitePhotoBase):
    id: UUID
    project_id: UUID
    phase_id: Optional[UUID] = None
    task_id: Optional[UUID] = None
    uploaded_by: UUID
    uploaded_by_name: Optional[str] = None
    file_url: str
    thumbnail_url: Optional[str] = None
    file_size_bytes: Optional[int] = None
    mime_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
