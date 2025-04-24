FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create logs directory
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Copy wait_for_db script first (to take advantage of the cache)
COPY wait_for_db.py .
RUN chmod +x wait_for_db.py

# Copy create_superuser script
COPY create_superuser.py .
RUN chmod +x create_superuser.py

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Command to start the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "task_manager.wsgi"] 