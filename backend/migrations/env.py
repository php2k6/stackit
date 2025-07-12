from logging.config import fileConfig
from sqlalchemy import create_engine, pool
from alembic import context
from app.config import settings  # your Pydantic-based config
from app.database import Base
from app import models  # ensure all models are imported

# Alembic Config
config = context.config

# Set up Python logging from .ini file (optional)
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata for auto-generation
target_metadata = Base.metadata

# Run migrations offline (no DB connection)
def run_migrations_offline():
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

# Run migrations online (real DB connection)
def run_migrations_online():
    engine = create_engine(settings.DATABASE_URL, poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()

# Choose mode
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
