from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import uuid

from app.dependencies import get_db, get_current_user, require_role
from app.models.project import Project, ProjectAssignment
from app.models.user import User
from app.schemas.projects import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    ProjectAssignmentCreate, ProjectAssignmentResponse
)
from app.schemas.site_photos import SitePhotoResponse
from app.utils.notifications import create_notification
from fastapi import UploadFile, File, Form
from typing import Optional

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create a new project (Admin only)."""
    project = Project(**project_in.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)

    if project.manager_id:
        assignment = ProjectAssignment(
            project_id=project.id,
            user_id=project.manager_id,
            role="project_manager"
        )
        db.add(assignment)
        await db.commit()

        # Notify PM
        await create_notification(
            db,
            user_id=project.manager_id,
            title="New Project Assigned",
            message=f"You have been assigned as the manager for project: {project.name}",
            notification_type="success",
            link=f"/pm/index.html"
        )

    # Notify Admins
    admin_result = await db.execute(select(User.id).where(User.role == "admin"))
    admin_ids = admin_result.scalars().all()
    for admin_id in admin_ids:
        if admin_id != current_user.id:
            await create_notification(
                db,
                user_id=admin_id,
                title="Project Created",
                message=f"A new project '{project.name}' has been created by {current_user.full_name}",
                notification_type="info",
                link=f"/admin/project-list.html"
            )

    # Reload with associations for the response
    res = await db.execute(
        select(Project).options(
            selectinload(Project.manager),
            selectinload(Project.assignments).selectinload(ProjectAssignment.user)
        ).where(Project.id == project.id)
    )
    project = res.scalar_one()

    return project

@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List projects. Admin sees all, others see only assigned projects."""

    query = select(Project).options(
        selectinload(Project.manager),
        selectinload(Project.assignments).selectinload(ProjectAssignment.user)
    ).distinct()
    
    if current_user.role != "admin":
        from sqlalchemy import or_
        query = (
            query
            .outerjoin(ProjectAssignment, Project.id == ProjectAssignment.project_id)
            .where(
                or_(
                    Project.manager_id == current_user.id,
                    ProjectAssignment.user_id == current_user.id
                )
            )
        )

    result = await db.execute(query.offset(skip).limit(limit))
    projects = result.scalars().all()

    res = []
    for p in projects:
        data = ProjectResponse.model_validate(p)
        if p.manager:
            data.manager_name = p.manager.full_name
            
        # Manually populate full_name for each assignment in the response
        # because pydantic model_validate might not pick up the property automatically
        for i, assignment in enumerate(p.assignments):
            if assignment.user:
                data.assignments[i].full_name = assignment.user.full_name
                
        res.append(data)
    return res

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific project. Must be Admin or assigned to the project."""
    
    query = select(Project).options(
        selectinload(Project.manager),
        selectinload(Project.assignments).selectinload(ProjectAssignment.user)
    ).where(Project.id == project_id)
    
    if current_user.role != "admin":
        from sqlalchemy import or_
        query = (
            query
            .outerjoin(ProjectAssignment, Project.id == ProjectAssignment.project_id)
            .where(
                or_(
                    Project.manager_id == current_user.id,
                    ProjectAssignment.user_id == current_user.id
                )
            )
        )

    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        exists_result = await db.execute(select(Project.id).where(Project.id == project_id))
        if exists_result.scalars().first() is not None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to this project.")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    data = ProjectResponse.model_validate(project)
    if project.manager:
        data.manager_name = project.manager.full_name
        
    for i, assignment in enumerate(project.assignments):
        if assignment.user:
            data.assignments[i].full_name = assignment.user.full_name
            
    return data


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_in: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Update a project (Admin only)."""
    result = await db.execute(
        select(Project).options(
            selectinload(Project.manager),
            selectinload(Project.assignments).selectinload(ProjectAssignment.user)
        ).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)

    # Reload with associations for the response
    res = await db.execute(
        select(Project).options(
            selectinload(Project.manager),
            selectinload(Project.assignments).selectinload(ProjectAssignment.user)
        ).where(Project.id == project.id)
    )
    project = res.scalar_one()

    data = ProjectResponse.model_validate(project)
    if project.manager:
        data.manager_name = project.manager.full_name
    return data


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Delete a project (Admin only)."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    await db.delete(project)
    await db.commit()
    return None


@router.post("/{project_id}/assignments", response_model=ProjectAssignmentResponse, status_code=status.HTTP_201_CREATED)
async def assign_user_to_project(
    project_id: UUID,
    assignment_in: ProjectAssignmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Assign a user to a project (Admin only)."""
    # Check project exists
    proj_result = await db.execute(select(Project).where(Project.id == project_id))
    project = proj_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
    # Check user exists
    user_result = await db.execute(select(User).where(User.id == assignment_in.user_id))
    if not user_result.scalars().first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Check existing assignment
    existing_result = await db.execute(
        select(ProjectAssignment)
        .where(
            ProjectAssignment.project_id == project_id, 
            ProjectAssignment.user_id == assignment_in.user_id
        )
    )
    if existing_result.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already assigned to this project.")

    assignment = ProjectAssignment(
        project_id=project_id,
        user_id=assignment_in.user_id,
        role=assignment_in.role
    )
    db.add(assignment)
    
    # If role is project_manager, update the project's manager_id for easier lookup
    if assignment_in.role == 'project_manager':
        project.manager_id = assignment_in.user_id
        db.add(project)

    await db.commit()
    await db.refresh(assignment)

    # Notify User
    await create_notification(
        db,
        user_id=assignment.user_id,
        title="Project Assignment",
        message=f"You have been assigned to project: {project.name} as {assignment.role.replace('_', ' ').title()}",
        notification_type="info",
        link=f"/{assignment.role.split('_')[0]}/index.html"
    )

    return assignment

@router.get("/{project_id}/assignments", response_model=List[ProjectAssignmentResponse])
async def list_project_assignments(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all assignments for a specific project."""
    # Verify access
    if current_user.role != "admin":
        # Check if user is manager or assigned
        proj_res = await db.execute(select(Project).where(Project.id == project_id))
        project = proj_res.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
        if project.manager_id != current_user.id:
            # Not the manager, check assignments
            assign_res = await db.execute(
                select(ProjectAssignment).where(
                    ProjectAssignment.project_id == project_id,
                    ProjectAssignment.user_id == current_user.id
                )
            )
            if not assign_res.scalars().first():
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this project team.")

    # Fetch all assignments with user details joined in a single query
    query = (
        select(
            ProjectAssignment.id,
            ProjectAssignment.project_id,
            ProjectAssignment.user_id,
            ProjectAssignment.role,
            ProjectAssignment.created_at,
            User.full_name
        )
        .join(User, ProjectAssignment.user_id == User.id)
        .where(ProjectAssignment.project_id == project_id)
    )
    result = await db.execute(query)
    
    assignments = []
    assigned_user_ids = set()
    for row in result.all():
        data = ProjectAssignmentResponse(
            id=row.id,
            project_id=row.project_id,
            user_id=row.user_id,
            role=row.role,
            full_name=row.full_name,
            created_at=row.created_at
        )
        assignments.append(data)
        assigned_user_ids.add(row.user_id)
    
    # If the manager is not in assignments, add them
    proj_res = await db.execute(select(Project).options(selectinload(Project.manager)).where(Project.id == project_id))
    project = proj_res.scalar_one_or_none()
    if project and project.manager_id and project.manager_id not in assigned_user_ids:
        assignments.append(ProjectAssignmentResponse(
            id=uuid.uuid4(), # Virtual ID
            project_id=project_id,
            user_id=project.manager_id,
            role="project_manager",
            full_name=project.manager.full_name if project.manager else "Project Manager",
            created_at=project.created_at

        ))
        
    return assignments

@router.post("/{project_id}/photos", response_model=SitePhotoResponse, status_code=status.HTTP_201_CREATED)
async def upload_project_photo(
    project_id: UUID,
    phase_id: Optional[UUID] = Form(None),
    task_id: Optional[UUID] = Form(None),
    category: str = Form("general"),
    caption: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.routers.site_photos import upload_site_photo
    return await upload_site_photo(project_id, phase_id, task_id, category, caption, file, db, current_user)

@router.get("/{project_id}/photos", response_model=List[SitePhotoResponse])
async def get_project_photos(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.routers.site_photos import list_site_photos
    return await list_site_photos(project_id, db, current_user)
