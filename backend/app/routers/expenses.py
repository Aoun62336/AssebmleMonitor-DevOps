from uuid import UUID
from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_role
from app.models.expense import Expense
from app.models.project import Project, ProjectAssignment
from app.models.material import Material
from app.models.user import User
from app.schemas.expenses import (
    ExpenseCreate, ExpenseUpdate, ExpenseResponse, ExpenseSummaryResponse
)
from app.utils.notifications import create_notification

router = APIRouter(prefix="/expenses", tags=["Expenses"])

async def _verify_pm_access(db: AsyncSession, project_id: Union[UUID, str], user: User):
    if user.role == "admin":
        return
    if isinstance(project_id, str):
        try:
            project_id = UUID(project_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid project ID format")
    result = await db.execute(
        select(ProjectAssignment)
        .where(ProjectAssignment.project_id == project_id, ProjectAssignment.user_id == user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to this project.")

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_in: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("project_manager", "admin"))
):
    """Create an expense (PM/Admin only)."""
    await _verify_pm_access(db, expense_in.project_id, current_user)

    expense = Expense(**expense_in.model_dump(), submitted_by=current_user.id)
    db.add(expense)
    await db.commit()
    await db.refresh(expense)

    # Reload with associations for the response
    res = await db.execute(
        select(Expense).options(selectinload(Expense.submitted_by_user)).where(Expense.id == expense.id)
    )
    expense = res.scalar_one()

    # Notify Admins
    admin_result = await db.execute(select(User.id).where(User.role == "admin"))
    for admin_id in admin_result.scalars().all():
        if admin_id != current_user.id:
            await create_notification(
                db,
                user_id=admin_id,
                title="Expense Added",
                message=f"New expense of ₹{expense.amount} submitted by {current_user.full_name}",
                notification_type="warning",
                link="/admin/expenses.html"
            )

    return expense

@router.get("/project/{project_id}", response_model=List[ExpenseResponse])
async def list_expenses(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("project_manager", "admin"))
):
    """List expenses for a project (PM/Admin only)."""
    await _verify_pm_access(db, project_id, current_user)
    
    result = await db.execute(
        select(Expense)
        .options(selectinload(Expense.submitted_by_user))
        .where(Expense.project_id == project_id)
        .order_by(Expense.expense_date.desc())
    )
    return list(result.scalars().all())

@router.patch("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: str,
    expense_in: ExpenseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("project_manager", "admin"))
):
    """Update an expense. PM/Admin only."""
    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    await _verify_pm_access(db, expense.project_id, current_user)

    update_data = expense_in.model_dump(exclude_unset=True)
    
    if "status" in update_data and update_data["status"] == "approved" and expense.status != "approved":
        expense.approved_by = current_user.id

    for field, value in update_data.items():
        setattr(expense, field, value)
        
    await db.commit()
    await db.refresh(expense)

    # Reload with associations for the response
    res = await db.execute(
        select(Expense).options(selectinload(Expense.submitted_by_user)).where(Expense.id == expense.id)
    )
    expense = res.scalar_one()
    return expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("project_manager", "admin"))
):
    """Delete an expense (PM/Admin only)."""
    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    await _verify_pm_access(db, expense.project_id, current_user)
    
    await db.delete(expense)
    await db.commit()
    return None

@router.get("/summary/project/{project_id}", response_model=ExpenseSummaryResponse)
async def get_expense_summary(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("project_manager", "admin"))
):
    """Calculate total expenses, material costs, and remaining budget."""
    await _verify_pm_access(db, project_id, current_user)
    
    # 1. Get project budget
    proj_res = await db.execute(select(Project).where(Project.id == project_id))
    project = proj_res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
    budget = float(project.budget) if project.budget is not None else 0.0

    # 2. Get total valid expenses
    exp_res = await db.execute(
        select(Expense).where(Expense.project_id == project_id, Expense.status != "rejected")
    )
    exp_list = list(exp_res.scalars().all())
    
    material_expenses = float(sum(e.amount for e in exp_list if e.category == "Materials"))
    total_expenses = float(sum(e.amount for e in exp_list if e.category != "Materials"))
    total_labor_cost = float(sum(e.amount for e in exp_list if e.category == "Labour Payment"))

    # 3. Get material costs from consumption
    mat_res = await db.execute(
        select(Material)
        .options(selectinload(Material.usage_records), selectinload(Material.stock_records))
        .where(Material.project_id == project_id)
    )
    consumption_material_cost = float(sum(m.total_used * float(m.unit_cost or 0.0) for m in mat_res.scalars().all()))
    
    total_material_cost = consumption_material_cost + material_expenses

    # 4. Compute
    total_spent = total_expenses + total_material_cost
    remaining_budget = budget - total_spent

    return ExpenseSummaryResponse(
        project_id=project_id,
        total_budget=budget,
        total_expenses=total_expenses,
        total_material_cost=total_material_cost,
        total_labor_cost=total_labor_cost,
        total_spent=total_spent,
        remaining_budget=remaining_budget
    )
