from uuid import UUID
from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.models.project import Project, ProjectAssignment
from app.models.phase import Phase
from app.models.task import Task
from app.models.expense import Expense
from app.models.material import Material
from app.models.attendance import Attendance
from app.models.user import User

from app.schemas.analytics import (
    ProjectOverviewResponse, TaskStats, GanttResponse, GanttTaskResponse, GanttPhaseResponse,
    BudgetAnalyticsResponse, MaterialAnalyticsResponse,
    AttendanceSummaryResponse, AdminOverviewResponse, ActivityResponse
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

async def _get_project_if_assigned(db: AsyncSession, project_id: Union[UUID, str], user: User) -> Project:
    if user.role == "admin":
        if isinstance(project_id, str):
            try:
                project_id = UUID(project_id)
            except ValueError:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid project ID format")
        result = await db.execute(select(Project).where(Project.id == project_id))
    else:
        if isinstance(project_id, str):
            try:
                project_id = UUID(project_id)
            except ValueError:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid project ID format")
        result = await db.execute(
            select(Project)
            .join(ProjectAssignment)
            .where(Project.id == project_id, ProjectAssignment.user_id == user.id)
        )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or access denied")
    return project

@router.get("/overview", response_model=List[ProjectOverviewResponse])
async def get_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get high-level overview of projects assigned to the user."""
    if current_user.role == "admin":
        projects_res = await db.execute(select(Project))
    else:
        projects_res = await db.execute(
            select(Project).join(ProjectAssignment).where(ProjectAssignment.user_id == current_user.id).distinct()
        )
    projects = projects_res.scalars().all()
    
    response = []
    for p in projects:
        # Get tasks
        tasks_res = await db.execute(
            select(Task).join(Phase).where(Phase.project_id == p.id)
        )
        tasks = tasks_res.scalars().all()
        
        total = len(tasks)
        completed = sum(1 for t in tasks if t.status == "completed")
        in_progress = sum(1 for t in tasks if t.status == "in_progress")
        not_started = sum(1 for t in tasks if t.status == "not_started")
        delayed = sum(1 for t in tasks if t.is_delayed)
        
        progress_pct = (completed / total * 100) if total > 0 else 0.0
        
        # Get budget info
        budget = float(p.budget) if p.budget else 0.0
        budget_used_pct = 0.0
        try:
            exp_res = await db.execute(
                select(Expense).where(Expense.project_id == p.id, Expense.status != "rejected")
            )
            total_exp = sum(float(e.amount) for e in exp_res.scalars().all())
            mat_res2 = await db.execute(
                select(Material)
                .options(selectinload(Material.usage_records), selectinload(Material.stock_records))
                .where(Material.project_id == p.id)
            )
            total_mat2 = sum(float(m.total_used) * float(m.unit_cost or 0.0) for m in mat_res2.scalars().all())
            total_spent2 = total_exp + total_mat2
            budget_used_pct = round((total_spent2 / budget * 100) if budget > 0 else 0.0, 2)
        except Exception as e:
            print("Error calculating budget_used_pct:", e)
        
        response.append(ProjectOverviewResponse(
            project_id=str(p.id),
            project_name=p.name,
            name=p.name,
            status=p.status,
            start_date=p.start_date,
            end_date=p.end_date,
            progress_pct=round(progress_pct, 2),
            budget=budget,
            budget_used_pct=budget_used_pct,
            task_stats=TaskStats(
                total=total,
                completed=completed,
                in_progress=in_progress,
                not_started=not_started,
                delayed=delayed
            )
        ))
        
    return response

@router.get("/gantt", response_model=GanttResponse)
async def get_gantt(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task timeline data for Gantt chart rendering. Returns all phases even if empty."""
    await _get_project_if_assigned(db, project_id, current_user)

    # Load ALL phases for the project (even those with no tasks)
    phases_result = await db.execute(
        select(Phase).where(Phase.project_id == project_id).order_by(Phase.order_index)
    )
    phases = phases_result.scalars().all()

    # Load tasks with their phases
    result = await db.execute(
        select(Task).options(selectinload(Task.phase)).join(Phase).where(Phase.project_id == project_id).order_by(Task.start_date)
    )
    tasks = result.scalars().all()

    gantt_tasks = []
    for t in tasks:
        gantt_tasks.append(GanttTaskResponse(
            id=str(t.id),
            name=t.name,
            phase_name=t.phase.name if t.phase else "Unphased",
            phase_id=t.phase_id,
            project_id=t.project_id,
            assigned_to=t.assigned_to,
            start_date=t.start_date,
            due_date=t.due_date,
            completed_date=t.completed_date,
            status=t.status,
            is_delayed=t.is_delayed
        ))

    return GanttResponse(project_id=project_id, tasks=gantt_tasks, phases=phases)


@router.get("/budget", response_model=BudgetAnalyticsResponse)
async def get_budget_analytics(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("project_manager", "admin", "client"))
):
    """Get project budget, total spent, and material costs."""
    project = await _get_project_if_assigned(db, project_id, current_user)
    
    budget = float(project.budget) if project.budget else 0.0
    
    # Expenses
    exp_res = await db.execute(
        select(Expense).where(Expense.project_id == project_id, Expense.status != "rejected")
    )
    total_expenses = sum(float(e.amount) for e in exp_res.scalars().all())
    
    # Material costs
    mat_res = await db.execute(
        select(Material)
        .options(selectinload(Material.usage_records), selectinload(Material.stock_records))
        .where(Material.project_id == project_id)
    )
    total_material_cost = sum(float(m.total_used) * float(m.unit_cost or 0.0) for m in mat_res.scalars().all())
    
    total_spent = total_expenses + total_material_cost
    remaining_budget = budget - total_spent
    budget_used_pct = (total_spent / budget * 100) if budget > 0 else 0.0
    
    return BudgetAnalyticsResponse(
        project_id=project_id,
        total_budget=budget,
        total_expenses=total_expenses,
        total_material_cost=total_material_cost,
        total_spent=total_spent,
        remaining_budget=remaining_budget,
        budget_used_pct=round(budget_used_pct, 2)
    )

@router.get("/materials", response_model=MaterialAnalyticsResponse)
async def get_material_analytics(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get summary of materials, low stock items, and material costs."""
    await _get_project_if_assigned(db, project_id, current_user)
    
    mat_res = await db.execute(
        select(Material)
        .options(selectinload(Material.usage_records), selectinload(Material.stock_records))
        .where(Material.project_id == project_id)
    )
    materials = mat_res.scalars().all()
    
    total_material_types = len(materials)
    low_stock_items = sum(1 for m in materials if m.is_low_stock)
    total_material_cost = sum(float(m.total_used) * float(m.unit_cost or 0.0) for m in materials)
    
    return MaterialAnalyticsResponse(
        project_id=project_id,
        total_material_types=total_material_types,
        low_stock_items=low_stock_items,
        total_material_cost=total_material_cost
    )

@router.get("/attendance-summary", response_model=AttendanceSummaryResponse)
async def get_attendance_summary(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overall attendance checkins and hours for the project."""
    await _get_project_if_assigned(db, project_id, current_user)
    
    att_res = await db.execute(select(Attendance).where(Attendance.project_id == project_id))
    attendances = att_res.scalars().all()
    
    total_checkins = len(attendances)
    total_hours = sum(a.total_hours for a in attendances)
    
    return AttendanceSummaryResponse(
        project_id=project_id,
        total_checkins=total_checkins,
        total_hours_logged=round(total_hours, 2)
    )

@router.get("/admin-overview", response_model=AdminOverviewResponse)
async def get_admin_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Global platform statistics for Admin Dashboard."""
    # Users
    users_res = await db.execute(select(func.count(User.id)))
    total_users = users_res.scalar() or 0
    
    # Projects
    projects_res = await db.execute(select(Project))
    projects = projects_res.scalars().all()
    total_projects = len(projects)
    active_projects = sum(1 for p in projects if p.status == "active")
    
    total_platform_budget = sum(p.budget or 0.0 for p in projects)
    
    # Total spent platform-wide
    # 1. All valid expenses
    exp_res = await db.execute(select(Expense).where(Expense.status != "rejected"))
    total_exp = sum(float(e.amount) for e in exp_res.scalars().all())
    
    # 2. All material costs
    mat_res = await db.execute(
        select(Material)
        .options(selectinload(Material.usage_records), selectinload(Material.stock_records))
    )
    total_mat_cost = sum(float(m.total_used) * float(m.unit_cost or 0.0) for m in mat_res.scalars().all())
    
    return AdminOverviewResponse(
        total_users=total_users,
        total_projects=total_projects,
        active_projects=active_projects,
        total_platform_budget=total_platform_budget,
        total_platform_spent=total_exp + total_mat_cost
    )

@router.get("/recent-activity", response_model=List[ActivityResponse])
async def get_recent_activity(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recent activity/notifications for the user's projects."""
    if current_user.role == "admin":
        projects_res = await db.execute(select(Project.id))
    else:
        projects_res = await db.execute(
            select(Project.id).join(ProjectAssignment).where(ProjectAssignment.user_id == current_user.id).distinct()
        )
    project_ids = list(projects_res.scalars().all())
    
    if not project_ids:
        return []

    activities = []
    from datetime import datetime, timezone

    def format_time_ago(dt):
        if not dt: return "recently"
        now = datetime.now(timezone.utc)
        if dt.tzinfo is None: dt = dt.replace(tzinfo=timezone.utc)
        diff = now - dt
        if diff.days > 0: return f"{diff.days}d ago"
        hrs = diff.seconds // 3600
        if hrs > 0: return f"{hrs}h ago"
        mins = diff.seconds // 60
        if mins > 0: return f"{mins}m ago"
        return "just now"

    tasks_res = await db.execute(select(Task).join(Phase).where(Phase.project_id.in_(project_ids)).order_by(Task.updated_at.desc()).limit(limit))
    for t in tasks_res.scalars().all():
        dt = t.updated_at or t.created_at
        activities.append({
            "id": str(t.id), "type": "task",
            "title": "Task Updated", "description": f"{t.name} → {t.status}",
            "time_ago": format_time_ago(dt), "color": "blue", "dt": dt
        })

    mats_res = await db.execute(select(Material).where(Material.project_id.in_(project_ids)).order_by(Material.updated_at.desc()).limit(limit))
    for m in mats_res.scalars().all():
        dt = m.updated_at or m.created_at
        activities.append({
            "id": str(m.id), "type": "material",
            "title": "Material Updated", "description": f"{m.name} stock updated",
            "time_ago": format_time_ago(dt), "color": "orange", "dt": dt
        })

    proj_res = await db.execute(select(Project).where(Project.id.in_(project_ids)).order_by(Project.created_at.desc()).limit(limit))
    for p in proj_res.scalars().all():
        dt = p.updated_at or p.created_at
        activities.append({
            "id": str(p.id), "type": "project",
            "title": "Project Update", "description": f"{p.name} was created or modified",
            "time_ago": format_time_ago(dt), "color": "green", "dt": dt
        })

    if current_user.role == "admin":
        user_res = await db.execute(select(User).order_by(User.created_at.desc()).limit(limit))
        for u in user_res.scalars().all():
            dt = u.updated_at or u.created_at
            activities.append({
                "id": str(u.id), "type": "user",
                "title": "User Registration", "description": f"{u.full_name} joined as {u.role}",
                "time_ago": format_time_ago(dt), "color": "purple", "dt": dt
            })

    def get_dt(x):
        dt = x["dt"]
        if not dt: return datetime.min.replace(tzinfo=timezone.utc)
        if dt.tzinfo is None: return dt.replace(tzinfo=timezone.utc)
        return dt

    activities.sort(key=get_dt, reverse=True)
    
    response = []
    for a in activities[:limit]:
        response.append(ActivityResponse(
            id=a["id"], type=a["type"], title=a["title"], description=a["description"], time_ago=a["time_ago"], color=a["color"]
        ))
    return response
