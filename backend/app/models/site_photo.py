"""
SitePhoto model.

Stores metadata about photos uploaded from the construction site.
The actual binary is stored on disk / object storage; this table holds the URL/path.
"""

import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.project import Project
    from app.models.phase import Phase
    from app.models.task import Task


_VALID_CATEGORIES = (
    "progress",
    "issue",
    "material",
    "safety",
    "milestone",
    "general",
    "completion",
)


class SitePhoto(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "site_photos"
    __table_args__ = (
        CheckConstraint(
            f"category IN {_VALID_CATEGORIES}",
            name="ck_site_photos_category",
        ),
    )

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    phase_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("phases.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    task_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    caption: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    category: Mapped[str] = mapped_column(
        String(20), nullable=False, default="general", server_default="general"
    )
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    project: Mapped["Project"] = relationship(
        "Project", back_populates="site_photos"
    )
    phase: Mapped[Optional["Phase"]] = relationship("Phase")
    task: Mapped[Optional["Task"]] = relationship("Task")
    uploaded_by_user: Mapped["User"] = relationship(
        "User",
        back_populates="site_photos",
        foreign_keys=[uploaded_by],
    )

    @property
    def uploaded_by_name(self) -> str | None:
        """Convenience accessor for Pydantic serialization via from_attributes."""
        if self.uploaded_by_user is not None:
            return self.uploaded_by_user.full_name
        return None

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<SitePhoto id={self.id} project={self.project_id} "
            f"category={self.category!r}>"
        )
