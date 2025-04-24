"""
Constants used throughout the tasks application.

This module centralizes all constants, error messages, and format strings
used across multiple files in the application to maintain consistency
and simplify future updates.
"""

from typing import Final

# Date formats
DATE_FORMAT: Final[str] = "%Y-%m-%d"
DATE_FORMAT_DISPLAY: Final[str] = "YYYY-MM-DD"
USERNAME_STR: Final[str] = "username"
EMAIL_STR: Final[str] = "email"
FIRST_NAME_STR: Final[str] = "first_name"
LAST_NAME_STR: Final[str] = "last_name"
PASSWORD_STR: Final[str] = "password"
PASSWORD_CONFIRM_STR: Final[str] = "password_confirm"
ID_STR: Final[str] = "id"

# Error messages
ERROR_MESSAGES = {
    "invalid_date_format": f"Invalid date format. Use {DATE_FORMAT_DISPLAY}.",
    "due_date_before_start": "The due date must be later or equal to the start date.",
    "task_overlap": "This task overlaps with an existing task.",
    "empty_title": "The title cannot be empty.",
    "past_start_date": "The start date cannot be in the past.",
}

# Field requirements
FIELD_REQUIREMENTS = {
    "title_required": "Title is required.",
    "start_date_required": "Start date is required.",
}

# API response messages
API_RESPONSES = {
    "task_created": "Task created successfully.",
    "task_updated": "Task updated successfully.",
    "task_deleted": "Task deleted successfully.",
}

# Query parameters
QUERY_PARAMS = {
    "start_date": "start",
    "end_date": "end",
}

# Model verbosity names
MODEL_VERBOSE_NAMES = {
    "task": "Task",
    "tasks": "Tasks",
}

# Pagination settings
PAGINATION = {
    "default_page_size": 10,
    "max_page_size": 100,
}
