import os
import pytest
from django.conf import settings
from model_bakery import baker
from datetime import date, timedelta

@pytest.fixture(scope="session")
def django_db_setup():
    """
    Configures an in-memory database for testing.
    This configuration overrides the database configuration in settings.py
    only during the execution of the tests.
    """
    settings.DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
            'TEST': {
                'NAME': ':memory:',
            },
        },
    }

@pytest.fixture
def api_client():
    """
    Provides an API client for testing the API views.
    """
    from rest_framework.test import APIClient
    return APIClient()

@pytest.fixture
def user_factory():
    """
    Factory to create test users.
    """
    def _create_user(**kwargs):
        return baker.make('auth.User', **kwargs)
    return _create_user

@pytest.fixture
def task_factory():
    """
    Factory to create test tasks.
    """
    def _create_task(**kwargs):
        # Default values for required fields if not provided
        today = date.today()
        defaults = {
            'title': 'Tarea de prueba',
            'start_date': today,
            'due_date': today + timedelta(days=1),
            'completed': False
        }
        # Update defaults with provided kwargs
        defaults.update(kwargs)
        return baker.make('tasks.Task', **defaults)
    return _create_task

@pytest.fixture
def authenticated_client(api_client, user_factory):
    """
    Provides an authenticated API client for testing views that require authentication.
    """
    user = user_factory(username='testuser', email='test@example.com')
    api_client.force_authenticate(user=user)
    return api_client, user 