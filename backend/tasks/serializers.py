from rest_framework import serializers
from tasks.models import Task
from users.serializers import UserBasicSerializer
from django.contrib.auth.models import User
from django.db.models import Q
import logging
from constants import ERROR_MESSAGES, FIELD_REQUIREMENTS
from datetime import date

# Configure logger
logger = logging.getLogger(__name__)


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the Task model.

    Provides validation to ensure:
    - The due date is later or equal to the start date
    - There is no overlap of tasks for the same user
    """

    assigned_user = UserBasicSerializer(source="user", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "start_date",
            "due_date",
            "completed",
            "user",
            "created_at",
            "updated_at",
            "assigned_user",
            "created_by",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "title": {
                "required": True,
                "error_messages": {"required": FIELD_REQUIREMENTS["title_required"]},
            },
            "start_date": {
                "required": True,
                "error_messages": {"required": FIELD_REQUIREMENTS["start_date_required"]},
            },
            "created_by": {
                "required": False,
            },
        }

    def validate_title(self, value: str) -> str:
        """
        Validate that the title is not empty.

        Args:
            value (str): Value of the title to validate.

        Returns:
            str: The validated value.

        Raises:
            serializers.ValidationError: If the title is empty.
        """
        if not value.strip():
            raise serializers.ValidationError(ERROR_MESSAGES["empty_title"])
        return value

    def validate(self, data: dict) -> dict:
        """
        Validate the data of the Task model.

        Ensures that:
        - The due date is later or equal to the start date
        - There is no overlap of tasks for the same user

        Args:
            data (dict): Data to validate.

        Returns:
            dict: Validated data.

        Raises:
            serializers.ValidationError: If the validation fails.
        """
        # Validate that the due date is later or equal to the start date
        start_date: date | None = data.get("start_date")
        due_date: date | None = data.get("due_date")

        if due_date and start_date and due_date < start_date:
            error_msg = ERROR_MESSAGES["due_date_before_start"]
            logger.warning(f"Validation failed: {error_msg}")
            raise serializers.ValidationError({"due_date": error_msg})

        # Validate task overlap
        user: User | None = data.get("user")

        if user and due_date:
            # Check if there are tasks that overlap
            task_id: int | None = self.instance.id if self.instance else None

            overlapping_query = Q(user=user, completed=False) & (
                # Check if task exists starts during our task
                Q(start_date__gte=start_date, start_date__lte=due_date)
                |
                # Check if task exists ends during our task
                Q(due_date__gte=start_date, due_date__lte=due_date)
                |
                # Check if task exists contains our task
                Q(start_date__lte=start_date, due_date__gte=due_date)
            )

            # Exclude the current task if it is being updated
            if task_id:
                overlapping_tasks = Task.objects.filter(overlapping_query).exclude(id=task_id)
            else:
                overlapping_tasks = Task.objects.filter(overlapping_query)

            if overlapping_tasks.exists():
                error_msg = ERROR_MESSAGES["task_overlap"]
                overlapping_task = overlapping_tasks.first()
                logger.warning(
                    f"Validation failed: {error_msg} User: {user.username} Overlapping task: {overlapping_task.title}"
                )
                raise serializers.ValidationError({"start_date": error_msg, "overlapping_task": overlapping_task.title})

        return data
