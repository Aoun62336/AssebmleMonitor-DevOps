"""
Material, MaterialStock, and MaterialUsage models.

Material      — catalogue entry for a construction material (per project)
MaterialStock — current stock level / inventory record
MaterialUsage — consumption record linked to a phase/task
"""

import uuid
from datetime import date
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.phase import Phase
    from app.models.task import Task
    from app.models.user import User


class Material(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Catalogue entry for a type of material within a project."""

    __tablename__ = "materials"

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
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    unit_cost: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    total_required_qty: Mapped[Optional[float]] = mapped_column(Numeric(14, 3), nullable=True)

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    project: Mapped["Project"] = relationship(
        "Project",
        back_populates="materials",
    )

    stock_records: Mapped[List["MaterialStock"]] = relationship(
        "MaterialStock",
        back_populates="material",
        cascade="all, delete-orphan",
    )

    usage_records: Mapped[List["MaterialUsage"]] = relationship(
        "MaterialUsage",
        back_populates="material",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Material id={self.id} name={self.name!r} unit={self.unit!r}>"

    @property
    def total_received(self) -> float:
        return sum((float(s.quantity) for s in self.stock_records), 0.0)

    @property
    def total_used(self) -> float:
        return sum((float(u.quantity_used) for u in self.usage_records), 0.0)

    @property
    def remaining_stock(self) -> float:
        return self.total_received - self.total_used

    @property
    def is_low_stock(self) -> bool:
        """
        Dynamically determine if stock is low.
        If total_required_qty is not set or 0, we don't flag as low stock unless it's negative.
        If set, flag as low if remaining stock is less than 10% of requirement or a minimum of 5 units.
        """
        if not self.total_required_qty or float(self.total_required_qty) <= 0:
            return False
        
        # Threshold is 10% of requirement, but at least 5 units to avoid noise for small projects
        threshold = max(float(self.total_required_qty) * 0.1, 5.0)
        return self.remaining_stock < threshold


class MaterialStock(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Inventory / stock level record for a material."""

    __tablename__ = "material_stock"
    __table_args__ = (
        CheckConstraint("quantity >= 0", name="ck_material_stock_qty_positive"),
    )

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    material_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("materials.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    quantity: Mapped[float] = mapped_column(Numeric(12, 3), nullable=False)
    received_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    supplier: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    material: Mapped["Material"] = relationship(
        "Material",
        back_populates="stock_records",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<MaterialStock id={self.id} material={self.material_id} "
            f"qty={self.quantity}>"
        )


class MaterialUsage(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Records how much of a material was used in a phase/task."""

    __tablename__ = "material_usage"
    __table_args__ = (
        CheckConstraint("quantity_used > 0", name="ck_material_usage_qty_positive"),
    )

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    material_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("materials.id", ondelete="CASCADE"),
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
    recorded_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    quantity_used: Mapped[float] = mapped_column(Numeric(12, 3), nullable=False)
    usage_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    material: Mapped["Material"] = relationship(
        "Material",
        back_populates="usage_records",
    )

    phase: Mapped[Optional["Phase"]] = relationship("Phase")
    task: Mapped[Optional["Task"]] = relationship("Task")
    recorder: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[recorded_by]
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<MaterialUsage id={self.id} material={self.material_id} "
            f"qty={self.quantity_used}>"
        )
