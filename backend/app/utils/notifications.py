
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification

async def create_notification(
    db: AsyncSession,
    user_id: uuid.UUID,
    title: str,
    message: Optional[str] = None,
    notification_type: str = "info",
    link: Optional[str] = None
):
    """
    Utility function to create a notification for a user.
    """
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        link=link,
        is_read=False
    )
    db.add(notification)
    await db.commit()
    return notification
