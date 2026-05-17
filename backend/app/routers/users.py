import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.dependencies import get_db, require_role
from app.models.user import User
from app.schemas.users import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create a new user (Admin only)."""
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    # Hash password and create user
    hashed_pwd = hash_password(user_in.password)
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        role=user_in.role,
        is_active=user_in.is_active
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # ID is UUID, schema expects str. Config from_attributes handles it if str works.
    return user


@router.get("", response_model=List[UserResponse])
async def list_users(
    role: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "project_manager"))
):
    """List users, filter by role/status."""
    query = select(User).where(User.is_deleted == False)
    
    if role:
        if role == "SE":
            query = query.where(User.role.in_(["site_engineer", "project_manager"]))
        elif role == "site_engineer":
            query = query.where(User.role == "site_engineer")
        else:
            query = query.where(User.role == role)
            
    if status == "active":
        query = query.where(User.is_active == True)
    elif status == "inactive":
        query = query.where(User.is_active == False)
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    return list(users)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Get a specific user by ID (Admin only)."""
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid user ID")
    result = await db.execute(select(User).where(User.id == uid, User.is_deleted == False))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Update a user (Admin only). Can be used to activate/deactivate."""
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid user ID")
    result = await db.execute(select(User).where(User.id == uid, User.is_deleted == False))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_data = user_in.model_dump(exclude_unset=True)
    
    if "password" in update_data:
        hashed_pwd = hash_password(update_data["password"])
        del update_data["password"]
        user.hashed_password = hashed_pwd
        
    for field, value in update_data.items():
        setattr(user, field, value)
        
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Hard-delete a user (Admin only)."""
    import logging
    from sqlalchemy import update, delete
    from app.models.project import Project, ProjectAssignment
    from app.models.site_photo import SitePhoto
    from app.models.expense import Expense
    from app.models.task import Task
    from app.models.notification import Notification
    from app.models.attendance import Attendance

    logger = logging.getLogger("uvicorn.error")
    logger.info(f"--- DELETE START --- {user_id}")

    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid user ID format")

    # Confirm user exists
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        # Clear all FK references before deleting the user
        await db.execute(
            update(Project).where(Project.manager_id == uid).values(manager_id=None)
        )
        await db.execute(
            delete(ProjectAssignment).where(ProjectAssignment.user_id == uid)
        )
        await db.execute(
            delete(Notification).where(Notification.user_id == uid)
        )
        await db.execute(
            delete(Attendance).where(Attendance.user_id == uid)
        )
        await db.execute(
            delete(SitePhoto).where(SitePhoto.uploaded_by == uid)
        )
        await db.execute(
            delete(Expense).where(Expense.submitted_by == uid)
        )
        await db.execute(
            update(Expense).where(Expense.approved_by == uid).values(approved_by=None)
        )
        await db.execute(
            update(Task).where(Task.assigned_to == uid).values(assigned_to=None)
        )

        # Now delete the user
        await db.delete(user)
        await db.commit()
        logger.info("DELETE COMMIT SUCCESS")
    except Exception as e:
        logger.error(f"DELETE ERROR: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "success"}







