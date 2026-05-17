from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.dependencies import get_db, require_role
from app.models.user import User
from app.models.project import Project

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/users/count")
async def get_users_count(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    res = await db.execute(select(func.count(User.id)))
    return {"count": res.scalar() or 0}

@router.get("/projects/count")
async def get_projects_count(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    res = await db.execute(select(func.count(Project.id)))
    return {"count": res.scalar() or 0}

@router.get("/projects/active")
async def get_active_projects(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    res = await db.execute(select(func.count(Project.id)).where(Project.status == "active"))
    return {"count": res.scalar() or 0}

@router.get("/projects/budget-summary")
async def get_budget_summary(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    res = await db.execute(select(func.sum(Project.budget)))
    return {"total_budget": float(res.scalar() or 0)}

@router.get("/logs")
async def get_system_logs(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    # Fetch recent users and projects to build a mock activity log
    users_res = await db.execute(select(User).order_by(desc(User.created_at)).limit(5))
    projects_res = await db.execute(select(Project).order_by(desc(Project.created_at)).limit(5))
    
    logs = []
    for u in users_res.scalars().all():
        logs.append({
            "id": f"usr-{u.id}",
            "message": f"User '{u.full_name}' was created.",
            "timestamp": u.created_at.isoformat()
        })
    for p in projects_res.scalars().all():
        logs.append({
            "id": f"proj-{p.id}",
            "message": f"Project '{p.name}' was created.",
            "timestamp": p.created_at.isoformat()
        })
        
    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    return logs[:10]

@router.delete("/delete-user/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if str(user.id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    if user.role == "admin":
        admin_count_res = await db.execute(select(func.count(User.id)).where(User.role == "admin"))
        if (admin_count_res.scalar() or 0) <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last admin user")
    
    try:
        # 1. Nullify manager_id on projects
        from app.models.project import Project, ProjectAssignment
        res = await db.execute(select(Project).where(Project.manager_id == user.id))
        for p in res.scalars().all():
            p.manager_id = None
            db.add(p)

        # 2. Delete assignments
        from sqlalchemy import delete
        await db.execute(delete(ProjectAssignment).where(ProjectAssignment.user_id == user.id))
        
        await db.delete(user)
        await db.commit()
        return {"detail": "User deleted successfully", "id": user_id}
    except Exception as e:
        await db.rollback()
        if "foreign key constraint" in str(e).lower():
            raise HTTPException(
                status_code=400, 
                detail="User cannot be deleted because they have associated records (expenses, photos, etc.). Deactivate them instead."
            )
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

