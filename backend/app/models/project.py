"""
Project and ProjectAssignment models.

Project           — a construction project
ProjectAssignment — many-to-many link between users and projects
"""

import uuid
from datetime import date
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    CheckConstraint,
    Date,
    ForeignKey,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.phase import Phase
    from app.models.material import Material
    from app.models.attendance import Attendance
    from app.models.expense import Expense
    from app.models.site_photo import SitePhoto


_VALID_STATUSES = ("planning", "active", "on_hold", "completed", "cancelled")


class Project(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "projects"
    __table_args__ = (
        CheckConstraint(
            f"status IN {_VALID_STATUSES}",
            name="ck_projects_status",
        ),
        CheckConstraint(
            "end_date IS NULL OR start_date IS NULL OR end_date >= start_date",
            name="ck_projects_date_order",
        ),
    )

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="planning", server_default="planning"
    )
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    budget: Mapped[Optional[float]] = mapped_column(Numeric(14, 2), nullable=True)

    manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    manager: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="managed_projects",
        foreign_keys=[manager_id],
    )

    assignments: Mapped[List["ProjectAssignment"]] = relationship(
        "ProjectAssignment",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    phases: Mapped[List["Phase"]] = relationship(
        "Phase",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="Phase.order_index",
    )

    materials: Mapped[List["Material"]] = relationship(
        "Material",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    attendance_records: Mapped[List["Attendance"]] = relationship(
        "Attendance",
        back_populates="project",
    )

    expenses: Mapped[List["Expense"]] = relationship(
        "Expense",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    site_photos: Mapped[List["SitePhoto"]] = relationship(
        "SitePhoto",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Project id={self.id} name={self.name!r}>"


class ProjectAssignment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Links a user to a project with a role-specific designation."""

    __tablename__ = "project_assignments"
    __table_args__ = (
        UniqueConstraint("project_id", "user_id", name="uq_project_assignments_pu"),
        CheckConstraint(
            "role IN ('project_manager', 'site_engineer', 'client')",
            name="ck_project_assignments_role",
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
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    project: Mapped["Project"] = relationship(
        "Project",
        back_populates="assignments",
    )
    user: Mapped["User"] = relationship(
        "User",
        back_populates="assignments",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<ProjectAssignment project={self.project_id} user={self.user_id} "
            f"role={self.role!r}>"
        )
