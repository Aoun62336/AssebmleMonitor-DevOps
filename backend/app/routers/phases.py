from uuid import UUID
from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.models.phase import Phase
from app.models.project import Project, ProjectAssignment
from app.models.user import User
from app.schemas.phases import PhaseCreate, PhaseUpdate, PhaseResponse

router = APIRouter(prefix="/phases", tags=["Phases"])

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
    if not result.scalars().first():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to this project.")

@router.post("", response_model=PhaseResponse, status_code=status.HTTP_201_CREATED)
async def create_phase(
    phase_in: PhaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("project_manager", "admin"))
):
    """Create a new phase (PM/Admin only)."""
    # Verify project exists and check dates
    proj_res = await db.execute(select(Project).where(Project.id == phase_in.project_id))
    project = proj_res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Date Validation: Phase must be within Project dates
    if phase_in.start_date and project.start_date and phase_in.start_date < project.start_date:
        raise HTTPException(status_code=400, detail="Phase dates must be within project duration")
    if phase_in.end_date and project.end_date and phase_in.end_date > project.end_date:
        raise HTTPException(status_code=400, detail="Phase dates must be within project duration")

    await _verify_project_access(db, phase_in.project_id, current_user)

    phase = Phase(**phase_in.model_dump())
    db.add(phase)
    await db.commit()
    await db.refresh(phase)
    
    # Refetch with project for project_name property in PhaseResponse
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Phase).options(selectinload(Phase.project)).where(Phase.id == phase.id)
    )
    phase = result.scalar_one()
    return phase

@router.get("/project/{project_id}", response_model=List[PhaseResponse])
async def list_phases(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List phases for a project."""
    await _verify_project_access(db, project_id, current_user)
    
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Phase).options(selectinload(Phase.project)).where(Phase.project_id == project_id).order_by(Phase.order_index)
    )
    return list(result.scalars().all())

@router.get("/{phase_id}", response_model=PhaseResponse)
async def get_phase(
    phase_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details for a specific phase."""
    from sqlalchemy.orm import selectinload
    result = await db.execute(select(Phase).options(selectinload(Phase.project)).where(Phase.id == phase_id))
    phase = result.scalar_one_or_none()
    if not phase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Phase not found")
    
    await _verify_project_access(db, phase.project_id, current_user)
    return phase

@router.patch("/{phase_id}", response_model=PhaseResponse)
@router.put("/{phase_id}", response_model=PhaseResponse)
async def update_phase(
    phase_id: str,
    phase_in: PhaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("project_manager", "admin"))
):
    """Update a phase (PM/Admin only). Status cannot be manually edited."""
    result = await db.execute(select(Phase).where(Phase.id == phase_id))
    phase = result.scalar_one_or_none()
    if not phase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Phase not found")

    await _verify_project_access(db, phase.project_id, current_user)

    update_data = phase_in.model_dump(exclude_unset=True)
    # STRICT RULE: Status cannot be manually edited
    if "status" in update_data:
        del update_data["status"]

    for field, value in update_data.items():
        setattr(phase, field, value)
        
    await db.commit()
    await db.refresh(phase)

    # Refetch with project for project_name property in PhaseResponse
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Phase).options(selectinload(Phase.project)).where(Phase.id == phase.id)
    )
    phase = result.scalar_one()
    return phase

@router.delete("/{phase_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_phase(
    phase_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("project_manager", "admin"))
):
    """Delete a phase (PM/Admin only)."""
    result = await db.execute(select(Phase).where(Phase.id == phase_id))
    phase = result.scalar_one_or_none()
    if not phase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Phase not found")

    await _verify_project_access(db, phase.project_id, current_user)

    await db.delete(phase)
    await db.commit()
    return None
