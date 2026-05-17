"""
Expense model.

Records financial expenses linked to a project and optionally to a phase.
Expenses require approval from a manager/admin.
"""

import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    CheckConstraint,
    Date,
    ForeignKey,
    Numeric,
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
    from app.models.phase import Phase


_VALID_CATEGORIES = (
    "Labour Payment",
    "Equipment Rental",
    "Transportation",
    "Materials",
    "Miscellaneous",
    "Office Supplies",
    "Site Utilities",
)
_VALID_STATUSES = ("pending", "approved", "rejected")


class Expense(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "expenses"
    __table_args__ = (
        CheckConstraint(
            f"category IN {_VALID_CATEGORIES}",
            name="ck_expenses_category",
        ),
        CheckConstraint(
            f"status IN {_VALID_STATUSES}",
            name="ck_expenses_status",
        ),
        CheckConstraint("amount > 0", name="ck_expenses_amount_positive"),
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
    submitted_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="INR", server_default="INR"
    )
    expense_date: Mapped[date] = mapped_column(Date, nullable=False)
    vendor: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    receipt_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending", server_default="pending"
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    project: Mapped["Project"] = relationship("Project", back_populates="expenses")
    phase: Mapped[Optional["Phase"]] = relationship("Phase", back_populates="expenses")

    submitted_by_user: Mapped["User"] = relationship(
        "User",
        back_populates="expenses",
        foreign_keys=[submitted_by],
    )
    approved_by_user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="approved_expenses",
        foreign_keys=[approved_by],
    )

    @property
    def submitter_name(self) -> str:
        return self.submitted_by_user.full_name if self.submitted_by_user else "Unknown"

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<Expense id={self.id} title={self.title!r} "
            f"amount={self.amount} status={self.status!r}>"
        )
