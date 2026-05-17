import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import Task
from app.models.phase import Phase
from app.models.project import Project

async def recalculate_project_status(db: AsyncSession, project_id: uuid.UUID):
    """
    Recalculates the overall project status based on its phases' progress.
    0% progress -> planning
    1% to 99% progress -> active
    100% progress -> completed
    """
    result = await db.execute(select(Phase).where(Phase.project_id == project_id))
    phases = result.scalars().all()
    
    project_result = await db.execute(select(Project).where(Project.id == project_id))
    project = project_result.scalar_one_or_none()
    if not project:
        return

    if not phases:
        if project.status != "planning":
            project.status = "planning"
            await db.commit()
        return

    total_progress = sum(float(p.progress_pct or 0) for p in phases)
    overall_progress = total_progress / len(phases)

    if overall_progress <= 0.0:
        new_status = "planning"
    elif overall_progress >= 100.0:
        new_status = "completed"
    else:
        new_status = "active"

    if project.status != new_status:
        project.status = new_status
        await db.commit()

async def recalculate_phase_status(db: AsyncSession, phase_id: uuid.UUID | str):
    """
    Recalculates the phase status and progress percentage based on its tasks.
    """
    if isinstance(phase_id, str):
        try:
            phase_id = uuid.UUID(phase_id)
        except ValueError:
            return # Or raise error
    # Get all tasks for the phase
    result = await db.execute(select(Task).where(Task.phase_id == phase_id))
    tasks = result.scalars().all()

    if not tasks:
        # No tasks, reset to not_started
        phase_result = await db.execute(select(Phase).where(Phase.id == phase_id))
        phase = phase_result.scalar_one_or_none()
        if phase:
            project_id = phase.project_id
            phase.status = "not_started"
            phase.progress_pct = 0.0
            await db.commit()
            await recalculate_project_status(db, project_id)
        return

    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == "completed")
    not_started_tasks = sum(1 for t in tasks if t.status == "not_started")

    # Calculate progress
    progress = (completed_tasks / total_tasks) * 100.0

    # Determine status
    if completed_tasks == total_tasks:
        status = "completed"
    elif not_started_tasks == total_tasks:
        status = "not_started"
    else:
        status = "in_progress"

    # Update phase
    phase_result = await db.execute(select(Phase).where(Phase.id == phase_id))
    phase = phase_result.scalar_one_or_none()
    if phase:
        project_id = phase.project_id
        phase.status = status
        phase.progress_pct = progress
        await db.commit()
        await recalculate_project_status(db, project_id)
