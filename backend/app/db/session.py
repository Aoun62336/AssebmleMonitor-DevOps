"""
Database engine and async session factory.

Uses SQLAlchemy 2.0 async API with asyncpg as the driver.
"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

engine = create_async_engine(
    str(settings.DATABASE_URL),
    echo=settings.DEBUG,        # log SQL only in debug mode
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,         # verify connections before checkout
    pool_recycle=3600,          # recycle connections every hour
)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)
