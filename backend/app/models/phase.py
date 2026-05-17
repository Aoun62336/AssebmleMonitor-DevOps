"""
Phase model.

A Phase is a logical division of a Project (e.g. Foundation, Framing, Finishing).
Phases are ordered within a project via order_index.
"""

import uuid
from datetime import date
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import CheckConstraint, Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.task import Task
    from app.models.expense import Expense


_VALID_STATUSES = ("not_started", "in_progress", "completed", "on_hold")


class Phase(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "phases"
    __table_args__ = (
        CheckConstraint(
            f"status IN {_VALID_STATUSES}",
            name="ck_phases_status",
        ),
        CheckConstraint(
            "end_date IS NULL OR start_date IS NULL OR end_date >= start_date",
            name="ck_phases_date_order",
        ),
        CheckConstraint("order_index >= 0", name="ck_phases_order_index_positive"),
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
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="not_started", server_default="not_started"
    )
    order_index: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    progress_pct: Mapped[float] = mapped_column(
        Numeric(5, 2), nullable=False, default=0.0, server_default="0"
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    project: Mapped["Project"] = relationship(
        "Project",
        back_populates="phases",
    )

    tasks: Mapped[List["Task"]] = relationship(
        "Task",
        back_populates="phase",
        cascade="all, delete-orphan",
    )

    expenses: Mapped[List["Expense"]] = relationship(
        "Expense",
        back_populates="phase",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Phase id={self.id} name={self.name!r} project={self.project_id}>"

    @property
    def project_name(self) -> Optional[str]:
        return self.project.name if self.project else None
