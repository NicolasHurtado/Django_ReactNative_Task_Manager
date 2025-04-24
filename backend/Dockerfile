FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for psycopg2
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=1.7.1 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_CREATE=false

# Install Poetry
RUN pip install --no-cache-dir "poetry==$POETRY_VERSION"

# Copy only the necessary files to install dependencies
COPY pyproject.toml poetry.lock ./


# Generate the lock file and install dependencies
RUN poetry install --no-interaction --no-ansi --no-root


COPY . .
RUN chmod +x wait_for_db.py create_superuser.py

# Expose port
EXPOSE 8000

# Command to start the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "task_manager.wsgi"] 