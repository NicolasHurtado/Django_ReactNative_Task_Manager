#!/usr/bin/env python
import os
import django

# Configurar entorno Django primero, antes de cualquier importación de modelos
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "task_manager.settings")
django.setup()

# Importar los modelos después de inicializar Django
from django.contrib.auth.models import User
from django.db.utils import IntegrityError


def create_superuser() -> None:
    """
    Create a superuser if it doesn't exist.

    The credentials are taken from environment variables:
    - DJANGO_SUPERUSER_USERNAME: Username (default: 'admin')
    - DJANGO_SUPERUSER_EMAIL: Email (default: 'admin@example.com')
    - DJANGO_SUPERUSER_PASSWORD: Password (default: 'admin123')
    """
    username: str = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
    email: str = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
    password: str = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin123")

    try:
        # Check if superuser exists
        if not User.objects.filter(is_superuser=True).exists():
            print(f"Creating superuser '{username}'...")
            User.objects.create_superuser(
                first_name=username, last_name="test", username=username, email=email, password=password
            )
            print("Superuser created successfully!")
        else:
            print("Superuser already exists.")
    except IntegrityError:
        print(f"Unable to create superuser. User '{username}' already exists.")
    except Exception as e:
        print(f"Error creating superuser: {str(e)}")


if __name__ == "__main__":
    create_superuser()
