from uuid import UUID
from typing import Optional, List
from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel, field_validator

class MaterialUnit(str, Enum):
    kg = "Kg"
    piece = "Piece"
    liter = "Liter"
    bag = "Bag"
    brass = "Brass"
    truck = "Truck"
    tractor = "Tractor"
    tonne = "Tonne"

# --- Material ---
class MaterialBase(BaseModel):
    name: str
    description: Optional[str] = None
    unit: str  # free-form string, e.g. 'Kg', 'Bag', 'Piece'
    unit_cost: Optional[float] = None
    total_required_qty: Optional[float] = None

class MaterialCreate(MaterialBase):
    project_id: UUID

class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    unit_cost: Optional[float] = None
    total_required_qty: Optional[float] = None

class MaterialResponse(MaterialBase):
    id: UUID
    project_id: UUID
    total_required_qty: Optional[float] = None
    total_received: float
    total_used: float
    remaining_stock: float
    is_low_stock: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True

# --- MaterialStock ---
class MaterialStockBase(BaseModel):
    quantity: float
    received_date: Optional[date] = None
    supplier: Optional[str] = None
    notes: Optional[str] = None

class MaterialStockCreate(MaterialStockBase):
    material_id: UUID

class MaterialStockResponse(MaterialStockBase):
    id: UUID
    material_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- MaterialUsage ---
class MaterialUsageBase(BaseModel):
    quantity_used: float
    usage_date: Optional[date] = None
    notes: Optional[str] = None

class MaterialUsageCreate(MaterialUsageBase):
    material_id: UUID
    phase_id: Optional[UUID] = None
    task_id: Optional[UUID] = None

class MaterialUsageResponse(MaterialUsageBase):
    id: UUID
    material_id: UUID
    phase_id: Optional[UUID] = None
    task_id: Optional[UUID] = None
    recorded_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Report Schema ---
class MaterialReportResponse(BaseModel):
    material_name: str
    unit: str
    total_received: float
    total_used: float
    remaining_stock: float
    cost_incurred: float
