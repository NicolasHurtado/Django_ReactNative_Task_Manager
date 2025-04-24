from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
import logging
from constants import ERROR_MESSAGES, MODEL_VERBOSE_NAMES

# Configure logger
logger = logging.getLogger(__name__)


class Task(models.Model):
    """
    Model to store task information.

    Each task belongs to a specific user and contains information
    about its title, description, relevant dates, and completion status.

    Attributes:
        title (str): Task title.
        description (str): Detailed description (optional).
        start_date (date): Task start date.
        due_date (date): Task due date (optional).
        completed (bool): Indicates if the task has been completed.
        user (User): User to whom the task belongs.
        created_at (datetime): Creation timestamp.
        updated_at (datetime): Last update timestamp.
    """

    title = models.CharField(max_length=255, verbose_name="Title")
    description = models.TextField(blank=True, verbose_name="Description")
    start_date = models.DateField(verbose_name="Start date")
    due_date = models.DateField(null=True, blank=True, verbose_name="Due date")
    completed = models.BooleanField(default=False, verbose_name="Completed")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks", verbose_name="User")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creation timestamp")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Last update timestamp")

    def __str__(self) -> str:
        """
        String representation of the Task object.

        Returns:
            str: The task title.
        """
        return f"{self.title}"

    def clean(self) -> None:
        """
        Custom validations for the Task model.

        Raises:
            ValidationError: If any validation fails.
        """
        # Validate that the start date is not in the past (optional)
        if self.start_date and self.start_date < timezone.now().date() and not self.pk:
            # Only validate for new tasks
            logger.warning(f"Attempt to create a task with a start date in the past: {self.title}")

        # Validate that the due date is not before the start date
        if self.due_date and self.start_date and self.due_date < self.start_date:
            raise ValidationError({"due_date": ERROR_MESSAGES["due_date_before_start"]})

    def save(self, *args, **kwargs) -> None:
        """
        Saves the Task model instance, applying validations.

        Args:
            *args: Positional arguments.
            **kwargs: Keyword arguments.
        """
        self.clean()
        super().save(*args, **kwargs)

    def mark_as_completed(self) -> None:
        """
        Marks the task as completed and saves it.
        """
        if not self.completed:
            self.completed = True
            self.save()
            logger.info(f"Task marked as completed: {self.title}")

    class Meta:
        ordering = ["start_date", "due_date"]
        verbose_name = MODEL_VERBOSE_NAMES["task"]
        verbose_name_plural = MODEL_VERBOSE_NAMES["tasks"]
        indexes = [
            models.Index(fields=["user", "start_date"]),
            models.Index(fields=["user", "completed"]),
        ]
