from uuid import UUID
from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel

class ExpenseBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    amount: float
    currency: str = "INR"
    expense_date: date
    vendor: Optional[str] = None
    receipt_url: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    project_id: UUID
    phase_id: Optional[UUID] = None

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    expense_date: Optional[date] = None
    vendor: Optional[str] = None
    receipt_url: Optional[str] = None
    status: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: UUID
    project_id: UUID
    phase_id: Optional[UUID] = None
    submitted_by: UUID
    submitter_name: Optional[str] = None
    approved_by: Optional[UUID] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ExpenseSummaryResponse(BaseModel):
    project_id: UUID
    total_budget: float
    total_expenses: float
    total_material_cost: float
    total_labor_cost: float
    total_spent: float
    remaining_budget: float
