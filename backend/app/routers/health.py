"""
Health-check router — the only implemented endpoint in the foundation layer.

GET /api/health  → 200 OK with service status and DB connectivity result.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Service health check")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict:
    """Return API status and PostgreSQL connectivity.

    - **status**: always ``ok`` if the API is reachable.
    - **database**: ``connected`` or the error message.
    """
    db_status: str
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        db_status = f"error: {exc}"

    return {
        "status": "ok",
        "database": db_status,
        "version": "0.1.0",
    }
