"""
Models package.

Importing all models here ensures that SQLAlchemy registers them against the
shared Base.metadata so that Alembic's autogenerate can discover every table.

Import order matters where circular references exist — models with no FK
dependencies are imported first.
"""

# 1. Mixins (no table, just column helpers)
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin  # noqa: F401

# 2. Users — no FK to other app tables
from app.models.user import User  # noqa: F401

# 3. Projects & assignments — FK to users
from app.models.project import Project, ProjectAssignment  # noqa: F401

# 4. Phases — FK to projects
from app.models.phase import Phase  # noqa: F401

# 5. Tasks — FK to phases and users
from app.models.task import Task  # noqa: F401

# 6. Materials — FK to projects / phases / tasks / users
from app.models.material import Material, MaterialStock, MaterialUsage  # noqa: F401

# 7. Attendance — FK to users and projects
from app.models.attendance import Attendance  # noqa: F401

# 8. Expenses — FK to projects, phases, users
from app.models.expense import Expense  # noqa: F401

# 9. Site photos — FK to projects, phases, tasks, users
from app.models.site_photo import SitePhoto  # noqa: F401

# 10. Notifications — FK to users
from app.models.notification import Notification  # noqa: F401

__all__ = [
    "TimestampMixin",
    "UUIDPrimaryKeyMixin",
    "User",
    "Project",
    "ProjectAssignment",
    "Phase",
    "Task",
    "Material",
    "MaterialStock",
    "MaterialUsage",
    "Attendance",
    "Expense",
    "SitePhoto",
    "Notification",
]
