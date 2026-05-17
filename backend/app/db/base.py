"""
Shared SQLAlchemy declarative base.

All ORM models must inherit from *Base* defined here so that:
  - Alembic can discover them via autogenerate.
  - The metadata object is consistent across the application.

Import order for Alembic env.py:
    from app.db.base import Base          # noqa: F401
    from app.models import *              # noqa: F401, F403  — registers all models
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Application-wide SQLAlchemy declarative base."""
