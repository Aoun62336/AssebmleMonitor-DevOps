from uuid import UUID
from typing import List, Optional, Union
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_role, get_current_user
from app.models.attendance import Attendance
from app.models.project import Project, ProjectAssignment
from app.models.user import User
from app.schemas.attendance import (
    AttendanceCheckIn, AttendanceCheckOut, AttendanceResponse
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])

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

@router.post("/check-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def check_in(
    check_in_data: AttendanceCheckIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("site_engineer", "project_manager", "admin"))
):
    """Check-in for the day. Prevent duplicate check-ins."""
    await _verify_project_access(db, check_in_data.project_id, current_user)
    
    today = date.today()
    
    # Check if already checked in today
    existing = await db.execute(
        select(Attendance).where(
            Attendance.user_id == current_user.id,
            Attendance.project_id == check_in_data.project_id,
            Attendance.attendance_date == today
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Already checked in for this project today."
        )

    attendance = Attendance(
        user_id=current_user.id,
        project_id=check_in_data.project_id,
        attendance_date=today,
        check_in=datetime.now(timezone.utc),
        status="present",
        notes=check_in_data.notes
    )
    db.add(attendance)
    await db.commit()
    await db.refresh(attendance)
    
    res = AttendanceResponse.model_validate(attendance)
    res.user_name = current_user.full_name
    return res

@router.post("/check-out", response_model=AttendanceResponse)
async def check_out(
    check_out_data: AttendanceCheckOut,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("site_engineer", "project_manager", "admin"))
):
    """Check-out for the day. Calculates total_hours dynamically."""
    today = date.today()
    
    result = await db.execute(
        select(Attendance).where(
            Attendance.user_id == current_user.id,
            Attendance.project_id == check_out_data.project_id,
            Attendance.attendance_date == today
        )
    )
    attendance = result.scalar_one_or_none()
    
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No check-in record found for today."
        )
        
    if attendance.check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Already checked out today."
        )

    attendance.check_out = datetime.now(timezone.utc)
    if check_out_data.notes:
        if attendance.notes:
            attendance.notes += f"\nCheckout Note: {check_out_data.notes}"
        else:
            attendance.notes = check_out_data.notes

    await db.commit()
    await db.refresh(attendance)
    
    res = AttendanceResponse.model_validate(attendance)
    res.user_name = current_user.full_name
    return res

@router.get("/my", response_model=List[AttendanceResponse])
async def list_my_attendance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return current user's attendance records across all projects (for SE dashboard)."""
    from sqlalchemy.orm import joinedload
    result = await db.execute(
        select(Attendance)
        .options(joinedload(Attendance.user))
        .where(Attendance.user_id == current_user.id)
        .order_by(Attendance.attendance_date.desc())
    )
    records = result.scalars().all()
    res = []
    for r in records:
        data = AttendanceResponse.model_validate(r)
        data.user_name = r.user.full_name if r.user else "Unknown"
        res.append(data)
    return res

@router.get("/project/{project_id}", response_model=List[AttendanceResponse])
async def list_attendance(
    project_id: UUID,
    user_id: Optional[UUID] = None,
    att_status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List attendance records for a project with optional filters."""
    await _verify_project_access(db, project_id, current_user)
    
    if current_user.role == "site_engineer":
        user_id = current_user.id

    
    from sqlalchemy.orm import joinedload
    query = (
        select(Attendance)
        .options(joinedload(Attendance.user))
        .where(Attendance.project_id == project_id)
    )
    if user_id:
        query = query.where(Attendance.user_id == user_id)
    if att_status:
        query = query.where(Attendance.status == att_status)
    if start_date:
        query = query.where(Attendance.attendance_date >= start_date)
    if end_date:
        query = query.where(Attendance.attendance_date <= end_date)

    query = query.order_by(Attendance.attendance_date.desc())
    result = await db.execute(query)
    records = result.scalars().all()
    
    res = []
    for r in records:
        data = AttendanceResponse.model_validate(r)
        data.user_name = r.user.full_name if r.user else "Unknown"
        res.append(data)
    return res
