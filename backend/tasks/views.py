from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from django.db.models import Q, QuerySet
from datetime import datetime, date
import logging
from tasks.models import Task
from tasks.serializers import TaskSerializer
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from constants import DATE_FORMAT, DATE_FORMAT_DISPLAY, ERROR_MESSAGES, QUERY_PARAMS

# Configure logger
logger = logging.getLogger(__name__)

# Create your views here.


class TaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint for task management.

    Provides full CRUD functionality for the Task model,
    with filters by authenticated user and search by date range.
    """

    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Task]:
        """
        Returns only the tasks of the authenticated user.

        Returns:
            QuerySet: Filtered list of tasks of the current user.
        """
        user: User = self.request.user
        logger.info(f"User: {user}")
        return Task.objects.filter(user=user)

    def perform_create(self, serializer: TaskSerializer) -> None:
        """
        Automatically assigns the task to the authenticated user.

        Args:
            serializer: Validated Task serializer.
        """
        serializer.save(user=self.request.user)
        logger.info(f"Task created: {serializer.instance.title} by user {self.request.user.username}")

    def perform_update(self, serializer: TaskSerializer) -> None:
        """
        Updates a task and logs the action.

        Args:
            serializer: Validated Task serializer.
        """
        serializer.save()
        logger.info(f"Task updated: {serializer.instance.title} by user {self.request.user.username}")

    def perform_destroy(self, instance: Task) -> None:
        """
        Deletes a task and logs the action.

        Args:
            instance: Instance of Task to delete.
        """
        task_title: str = instance.title
        instance.delete()
        logger.info(f"Task deleted: {task_title} by user {self.request.user.username}")

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name=QUERY_PARAMS["start_date"],
                description=f"Start date ({DATE_FORMAT_DISPLAY})",
                required=False,
                type=OpenApiTypes.DATE,
            ),
            OpenApiParameter(
                name=QUERY_PARAMS["end_date"],
                description=f"End date ({DATE_FORMAT_DISPLAY})",
                required=False,
                type=OpenApiTypes.DATE,
            ),
        ],
        responses={200: TaskSerializer(many=True)},
    )
    @action(detail=False, methods=["get"])
    def search(self, request: Request) -> Response:
        """
        Endpoint for filtering tasks by date range.

        Query parameters:
            start (str): Start date in format YYYY-MM-DD
            end (str): End date in format YYYY-MM-DD

        Returns:
            Response: List of tasks that meet the search criteria.
        """
        start: str | None = request.query_params.get(QUERY_PARAMS["start_date"], None)
        end: str | None = request.query_params.get(QUERY_PARAMS["end_date"], None)

        queryset: QuerySet[Task] = self.get_queryset()

        if start:
            try:
                logger.info(f"Start date: {start}")
                start_date: date = datetime.strptime(start, DATE_FORMAT).date()
                queryset = queryset.filter(start_date__gte=start_date)
            except ValueError:
                logger.error(f"Invalid date format: {start}")
                return Response(
                    {"error": ERROR_MESSAGES["invalid_date_format"]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if end:
            try:
                logger.info(f"End date: {end}")
                end_date: date = datetime.strptime(end, DATE_FORMAT).date()
                queryset = queryset.filter(Q(due_date__lte=end_date) | Q(due_date__isnull=True))
            except ValueError:
                logger.error(f"Invalid date format: {end}")
                return Response(
                    {"error": ERROR_MESSAGES["invalid_date_format"]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer: TaskSerializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
