# Backend - Collaborative Task Manager

Backend for the task management application developed with Django and Django REST Framework.

## Features

- JWT user authentication
- Complete CRUD functionality for tasks
- Date range search and filtering
- Task overlap validation
- Logging system
- API documentation with Swagger/OpenAPI 3.0
- Automated tests with pytest and high coverage

## Technology Stack

- **Django**: Web framework
- **Django REST Framework**: RESTful API
- **SimpleJWT**: JWT authentication
- **drf-spectacular**: OpenAPI 3.0 documentation
- **PostgreSQL**: Database (SQLite in development)
- **Docker**: Deployment and development
- **Nginx**: Web server and reverse proxy
- **pytest**: Testing framework

## Best Practices Implemented

- **Clean Code**: Clean and well-documented code
- **Docstrings**: Complete documentation of classes and methods
- **Logging**: Logging system for auditing and debugging
- **DRY (Don't Repeat Yourself)**: Avoids code duplication
- **PEP 8**: Compliance with Python style standards
- **Robust validation**: Both at serializer and model levels
- **Type Hints**: Type suggestions for better readability
- **Testing**: Comprehensive tests, including complex validations

## Docker Configuration

The easiest way to run the backend is using Docker Compose. Make sure you have Docker and Docker Compose installed on your system.

### Environment Variables

The project uses an `.env` file located in the backend directory. This file should contain:

```
# Environment variables for Django
DEBUG=False
DJANGO_SECRET_KEY=django-insecure-+av4!)m(a)0lf&^bb#$774rjwgr^)u4dws5^yti@)&lm6=1_jd
ALLOWED_HOSTS=localhost,127.0.0.1,backend
DATABASE_URL=postgres://postgres:postgres@db:5432/task_manager

# Variables for PostgreSQL
POSTGRES_PASSWORD=postgres
POSTGRES_USER=postgres
POSTGRES_DB=task_manager
```

You can also customize the superuser credentials that are automatically created by modifying these variables in the `docker-compose.yml` file:

```yaml
environment:
  - DJANGO_SUPERUSER_USERNAME=admin
  - DJANGO_SUPERUSER_EMAIL=admin@example.com
  - DJANGO_SUPERUSER_PASSWORD=admin123
```

### Running with Docker Compose

```bash
# Inside the backend directory
docker-compose up --build
```

This will start three services:
- **PostgreSQL**: Database
- **Backend Django**: REST API
- **Nginx**: Web server for serving static files and reverse proxy

The application will be available at http://localhost

### Initial Access

A superuser is automatically created with the following default credentials:
- **Username**: admin
- **Password**: admin123
- **Email**: admin@example.com

You can use these credentials to:
1. Access the admin panel at http://localhost/admin/
2. Obtain JWT tokens at http://localhost/api/token/

## JWT Authentication and Swagger UI

The interactive API documentation is available at:
- **Swagger UI**: http://localhost/api/docs/
- **ReDoc**: http://localhost/api/redoc/
- **OpenAPI Schema**: http://localhost/api/schema/

### Getting a JWT Token

1. Access the `/api/token/` endpoint directly or from Swagger UI
2. Provide your credentials:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
3. You will receive an `access_token` and a `refresh_token`

### Authenticating in Swagger UI

To test protected endpoints in Swagger UI:

1. Click on the "Authorize" button (lock icon) at the top right
2. In the field, enter your token exactly in this format:
   ```
   Bearer eyJhbGciOiJIUzI1NiIs...
   ```
   (replace with your actual token, including the word "Bearer" and a space)
3. Click "Authorize"
4. Now you can access all protected endpoints

### API Endpoints

- `POST /api/auth/register/` - User registration
- `POST /api/token/` - Get JWT token
- `POST /api/token/refresh/` - Refresh JWT token
- `GET /api/tasks/` - List user tasks
- `POST /api/tasks/` - Create a new task
- `GET /api/tasks/<id>/` - Get task details
- `PUT /api/tasks/<id>/` - Update complete task
- `PATCH /api/tasks/<id>/` - Update specific fields
- `DELETE /api/tasks/<id>/` - Delete task
- `GET /api/tasks/search/?start=YYYY-MM-DD&end=YYYY-MM-DD` - Search tasks by date range

## Task Validations

The system implements several important validations for tasks:

1. **Consistent due date**: The due date must be equal to or later than the start date
2. **Overlap prevention**: A user cannot have tasks that overlap in time
3. **Special handling of tasks without a due date**: They are considered indefinitely extended

These validations are implemented in the serializer and are covered by specific tests.

## Local Development without Docker

If you prefer to develop without Docker:

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables or create a local .env file

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Start the development server:
```bash
python manage.py runserver
```

## Running Tests

The project uses pytest for testing. To run the tests:

```bash
# With Docker
docker-compose exec backend pytest

# Without Docker
pytest

# With coverage
pytest --cov=.
```

## Code Quality

This project follows development best practices and has tools to maintain code quality:

```bash
# Format code
black .

# Check style
flake8

# Verify typing
mypy .
``` 