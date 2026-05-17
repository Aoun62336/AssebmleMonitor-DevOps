"""
Attendance model.

Records daily check-in / check-out for each worker on a project site.
"""

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.project import Project


_VALID_STATUSES = ("present", "absent", "late", "half_day")


class Attendance(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "attendance"
    __table_args__ = (
        CheckConstraint(
            f"status IN {_VALID_STATUSES}",
            name="ck_attendance_status",
        ),
        CheckConstraint(
            "check_out IS NULL OR check_out > check_in",
            name="ck_attendance_checkout_after_checkin",
        ),
    )

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    attendance_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    check_in: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    check_out: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="present", server_default="present"
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    user: Mapped["User"] = relationship("User", back_populates="attendance_records")
    project: Mapped[Optional["Project"]] = relationship(
        "Project", back_populates="attendance_records"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<Attendance id={self.id} user={self.user_id} "
            f"date={self.attendance_date} status={self.status!r}>"
        )

    @property
    def total_hours(self) -> float:
        if self.check_in and self.check_out:
            delta = self.check_out - self.check_in
            return round(delta.total_seconds() / 3600.0, 2)
        return 0.0
