"""
User model.

Roles
-----
admin          — full system access
project_manager — manages one or more projects
site_engineer  — field-level task & attendance operations
client         — read-only project visibility
"""

import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, CheckConstraint, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.project import Project, ProjectAssignment
    from app.models.attendance import Attendance
    from app.models.expense import Expense
    from app.models.site_photo import SitePhoto
    from app.models.notification import Notification


_VALID_ROLES = ("admin", "project_manager", "site_engineer", "client")


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            f"role IN {_VALID_ROLES}",
            name="ck_users_role",
        ),
    )

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True, index=True
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )
    is_deleted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    managed_projects: Mapped[List["Project"]] = relationship(
        "Project",
        back_populates="manager",
        foreign_keys="Project.manager_id",
    )

    assignments: Mapped[List["ProjectAssignment"]] = relationship(
        "ProjectAssignment",
        back_populates="user",
    )

    attendance_records: Mapped[List["Attendance"]] = relationship(
        "Attendance",
        back_populates="user",
    )

    expenses: Mapped[List["Expense"]] = relationship(
        "Expense",
        back_populates="submitted_by_user",
        foreign_keys="Expense.submitted_by",
    )

    approved_expenses: Mapped[List["Expense"]] = relationship(
        "Expense",
        back_populates="approved_by_user",
        foreign_keys="Expense.approved_by",
    )

    site_photos: Mapped[List["SitePhoto"]] = relationship(
        "SitePhoto",
        back_populates="uploaded_by_user",
    )

    notifications: Mapped[List["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User id={self.id} email={self.email!r} role={self.role!r}>"
