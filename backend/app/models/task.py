"""
Task model.

A Task belongs to a Phase and can be assigned to a site engineer (User).
"""

import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.phase import Phase
    from app.models.user import User


_VALID_STATUSES = ("not_started", "in_progress", "completed", "blocked")
_VALID_PRIORITIES = ("low", "medium", "high", "critical")


class Task(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint(
            f"status IN {_VALID_STATUSES}",
            name="ck_tasks_status",
        ),
        CheckConstraint(
            f"priority IN {_VALID_PRIORITIES}",
            name="ck_tasks_priority",
        ),
        CheckConstraint(
            "due_date IS NULL OR start_date IS NULL OR due_date >= start_date",
            name="ck_tasks_date_order",
        ),
    )

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    phase_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("phases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assigned_to: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="not_started", server_default="not_started"
    )
    priority: Mapped[str] = mapped_column(
        String(20), nullable=False, default="medium", server_default="medium"
    )
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    completed_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    phase: Mapped["Phase"] = relationship(
        "Phase",
        back_populates="tasks",
    )

    assignee: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[assigned_to],
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Task id={self.id} name={self.name!r} status={self.status!r}>"

    @property
    def is_delayed(self) -> bool:
        from datetime import date
        if self.status == "completed":
            if self.due_date and self.completed_date:
                return self.completed_date > self.due_date
            return False
        if self.due_date:
            return date.today() > self.due_date
        return False

    @property
    def phase_name(self) -> Optional[str]:
        return self.phase.name if self.phase else None

    @property
    def project_id(self) -> Optional[uuid.UUID]:
        return self.phase.project_id if self.phase else None

    @property
    def assignee_name(self) -> Optional[str]:
        return self.assignee.full_name if self.assignee else "Unassigned"
