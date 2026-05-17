"""
Date/time helpers shared across the application.
"""

from __future__ import annotations

from datetime import datetime, timezone


def utcnow() -> datetime:
    """Return the current UTC datetime (timezone-aware).

    Prefer this over datetime.utcnow() which returns a naive datetime.
    """
    return datetime.now(timezone.utc)
