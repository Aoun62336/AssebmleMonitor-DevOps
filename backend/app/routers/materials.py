from uuid import UUID
from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_role, get_current_user
from app.models.material import Material, MaterialStock, MaterialUsage
from app.models.project import Project, ProjectAssignment
from app.models.user import User
from app.schemas.materials import (
    MaterialCreate, MaterialUpdate, MaterialResponse,
    MaterialStockCreate, MaterialStockResponse,
    MaterialUsageCreate, MaterialUsageResponse,
    MaterialReportResponse
)
from app.utils.notifications import create_notification

router = APIRouter(tags=["Materials"])

async def _verify_project_access(db: AsyncSession, project_id: Union[UUID, str], user: User):
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

# ---------------------------------------------------------------------------
# Materials Master
# ---------------------------------------------------------------------------

@router.post("/materials", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
async def create_material(
    material_in: MaterialCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("project_manager", "admin"))
):
    """Create a new material catalogue entry (PM/Admin only)."""
    await _verify_project_access(db, material_in.project_id, current_user)

    material = Material(**material_in.model_dump())
    db.add(material)
    await db.commit()
    await db.refresh(material)
    
    # Must reload with relationships to compute properties
    result = await db.execute(
        select(Material)
        .options(selectinload(Material.stock_records), selectinload(Material.usage_records))
        .where(Material.id == material.id)
    )
    material = result.scalar_one()

    # Notify Admins
    admin_result = await db.execute(select(User.id).where(User.role == "admin"))
    for admin_id in admin_result.scalars().all():
        if admin_id != current_user.id:
            await create_notification(
                db,
                user_id=admin_id,
                title="Material Added",
                message=f"New material '{material.name}' added to project.",
                notification_type="info",
                link="/admin/material-master.html"
            )

    return material

@router.get("/materials/project/{project_id}", response_model=List[MaterialResponse])
async def list_materials(
    project_id: UUID,
    name: str = None,
    low_stock_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List materials for a project, including calculated stock. Supports filtering."""
    await _verify_project_access(db, project_id, current_user)

    query = (
        select(Material)
        .options(selectinload(Material.stock_records), selectinload(Material.usage_records))
        .where(Material.project_id == project_id)
    )
    if name:
        query = query.where(Material.name.ilike(f"%{name}%"))
    query = query.order_by(Material.name)

    result = await db.execute(query)
    materials = list(result.scalars().all())

    if low_stock_only:
        materials = [m for m in materials if m.is_low_stock]

    return materials

# ---------------------------------------------------------------------------
# Material Stock
# ---------------------------------------------------------------------------

@router.post("/material-stock", response_model=MaterialStockResponse, status_code=status.HTTP_201_CREATED)
async def add_material_stock(
    stock_in: MaterialStockCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("project_manager", "admin"))
):
    """Add incoming stock for a material (PM/Admin only)."""
    # Verify material exists and access
    mat_res = await db.execute(
        select(Material)
        .options(selectinload(Material.stock_records), selectinload(Material.usage_records))
        .where(Material.id == stock_in.material_id)
    )
    material = mat_res.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
        
    await _verify_project_access(db, material.project_id, current_user)

    # Validate: total received + new quantity must not exceed total_required_qty
    if material.total_required_qty is not None:
        new_total = material.total_received + stock_in.quantity
        if new_total > float(material.total_required_qty):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Received quantity cannot exceed total required quantity. "
                    f"Required: {material.total_required_qty}, "
                    f"Already Received: {material.total_received}, "
                    f"Requested: {stock_in.quantity}, "
                    f"Max Allowed This Entry: {float(material.total_required_qty) - material.total_received:.3f}"
                )
            )

    stock = MaterialStock(**stock_in.model_dump())
    db.add(stock)
    await db.commit()
    await db.refresh(stock)

    # Notify PM if stock is added by someone else
    proj_res = await db.execute(select(Project).where(Project.id == material.project_id))
    project = proj_res.scalar_one_or_none()
    if project and project.manager_id and project.manager_id != current_user.id:
        await create_notification(
            db,
            user_id=project.manager_id,
            title="Stock Updated",
            message=f"New stock entry for '{material.name}': {stock.quantity} {material.unit}",
            notification_type="success",
            link="/pm/material-stock.html"
        )

    return stock

# ---------------------------------------------------------------------------
# Material Usage
# ---------------------------------------------------------------------------

@router.post("/material-usage", response_model=MaterialUsageResponse, status_code=status.HTTP_201_CREATED)
async def log_material_usage(
    usage_in: MaterialUsageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("site_engineer", "project_manager", "admin"))
):
    """Log consumption of a material (SE/PM/Admin)."""
    mat_res = await db.execute(
        select(Material)
        .options(selectinload(Material.stock_records), selectinload(Material.usage_records))
        .where(Material.id == usage_in.material_id)
    )
    material = mat_res.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
        
    await _verify_project_access(db, material.project_id, current_user)

    # Validate sufficient stock
    if material.remaining_stock < usage_in.quantity_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Insufficient stock. Available: {material.remaining_stock}, Requested: {usage_in.quantity_used}"
        )

    usage = MaterialUsage(**usage_in.model_dump(), recorded_by=current_user.id)
    db.add(usage)
    await db.commit()
    await db.refresh(usage)
    return usage

@router.get("/material-usage/report/project/{project_id}", response_model=List[MaterialReportResponse])
async def generate_material_report(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("project_manager", "admin"))
):
    """Generate a material consumption report for a project (PM/Admin only)."""
    await _verify_project_access(db, project_id, current_user)
    
    result = await db.execute(
        select(Material)
        .options(selectinload(Material.stock_records), selectinload(Material.usage_records))
        .where(Material.project_id == project_id)
    )
    materials = result.scalars().all()
    
    report = []
    for mat in materials:
        cost = mat.unit_cost if mat.unit_cost else 0.0
        cost_incurred = mat.total_used * float(cost)
        report.append(
            MaterialReportResponse(
                material_name=mat.name,
                unit=mat.unit,
                total_received=mat.total_received,
                total_used=mat.total_used,
                remaining_stock=mat.remaining_stock,
                cost_incurred=cost_incurred
            )
        )
        
    return report
