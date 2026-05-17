"""
Alembic environment configuration for AssembleMonitor.

Uses async SQLAlchemy engine (asyncpg) for online migrations via
run_migrations_online(), and a synchronous psycopg2 URL for offline mode.

Automatically enables the PostgreSQL uuid-ossp extension before running
migrations so that uuid_generate_v4() is available as a server default.
"""

from __future__ import annotations

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool, text
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# ---------------------------------------------------------------------------
# Load application metadata
# ---------------------------------------------------------------------------
# Import Base BEFORE any model modules so the metadata is registered.
from app.db.base import Base  # noqa: E402
from app.core.config import settings  # noqa: E402

# Ensure all models are imported so Alembic sees them during autogenerate.
import app.models  # noqa: F401, E402

# ---------------------------------------------------------------------------
# Alembic config object
# ---------------------------------------------------------------------------

config = context.config

# Override sqlalchemy.url from application settings (sync DSN for Alembic).
# Use %% to escape percent signs for configparser interpolation.
_sync_url = settings.SYNC_DATABASE_URL.replace('%', '%%')
config.set_main_option("sqlalchemy.url", _sync_url)

# Logging config from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# Migration runners
# ---------------------------------------------------------------------------


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (generates SQL script, no live DB)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    # Enable uuid-ossp extension so uuid_generate_v4() server defaults work.
    connection.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
    connection.commit()

    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations against a live database using an async engine."""
    # Build config dict and inject async URL directly to avoid configparser %% issues
    cfg = config.get_section(config.config_ini_section, {})
    cfg["sqlalchemy.url"] = str(settings.DATABASE_URL)
    connectable = async_engine_from_config(
        cfg,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
