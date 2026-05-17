from uuid import UUID
from typing import List, Optional
from pydantic import BaseModel
from datetime import date

# ---------------------------------------------------------
# Overview
# ---------------------------------------------------------
class TaskStats(BaseModel):
    total: int
    completed: int
    in_progress: int
    not_started: int
    delayed: int

class ProjectOverviewResponse(BaseModel):
    project_id: UUID
    project_name: str
    name: str = ""           # alias so frontend can use project.name
    status: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    progress_pct: float
    budget: Optional[float] = 0.0
    budget_used_pct: Optional[float] = 0.0
    task_stats: TaskStats

    class Config:
        from_attributes = True

    def model_post_init(self, __context):
        if not self.name:
            object.__setattr__(self, 'name', self.project_name)

# ---------------------------------------------------------
# Gantt
# ---------------------------------------------------------
class GanttTaskResponse(BaseModel):
    id: UUID
    name: str
    phase_name: str
    phase_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    completed_date: Optional[date] = None
    status: str
    is_delayed: bool

class GanttPhaseResponse(BaseModel):
    id: UUID
    name: str
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    order_index: Optional[int] = None

    class Config:
        from_attributes = True

class GanttResponse(BaseModel):
    project_id: UUID
    tasks: List[GanttTaskResponse]
    phases: Optional[List[GanttPhaseResponse]] = None

# ---------------------------------------------------------
# Budget
# ---------------------------------------------------------
class BudgetAnalyticsResponse(BaseModel):
    project_id: UUID
    total_budget: float
    total_expenses: float
    total_material_cost: float
    total_spent: float
    remaining_budget: float
    budget_used_pct: float

# ---------------------------------------------------------
# Materials
# ---------------------------------------------------------
class MaterialAnalyticsResponse(BaseModel):
    project_id: UUID
    total_material_types: int
    low_stock_items: int
    total_material_cost: float

# ---------------------------------------------------------
# Attendance
# ---------------------------------------------------------
class AttendanceSummaryResponse(BaseModel):
    project_id: UUID
    total_checkins: int
    total_hours_logged: float

# ---------------------------------------------------------
# Admin Overview
# ---------------------------------------------------------
class AdminOverviewResponse(BaseModel):
    total_users: int
    total_projects: int
    active_projects: int
    total_platform_budget: float
    total_platform_spent: float

class ActivityResponse(BaseModel):
    id: str
    type: str
    title: str
    description: str
    time_ago: str
    color: str
