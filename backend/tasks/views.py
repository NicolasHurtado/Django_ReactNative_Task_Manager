from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime
import logging
from .models import Task
from .serializers import TaskSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from .constants import DATE_FORMAT, DATE_FORMAT_DISPLAY, ERROR_MESSAGES, QUERY_PARAMS

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

    def get_queryset(self):
        """
        Returns only the tasks of the authenticated user.
        
        Returns:
            QuerySet: Filtered list of tasks of the current user.
        """
        user = self.request.user
        logger.info(f"User: {user}")
        return Task.objects.filter(user=user)

    def perform_create(self, serializer):
        """
        Automatically assigns the task to the authenticated user.
        
        Args:
            serializer: Validated Task serializer.
        """
        serializer.save(user=self.request.user)
        logger.info(
            f"Task created: {serializer.instance.title} by user {self.request.user.username}"
        )

    def perform_update(self, serializer):
        """
        Updates a task and logs the action.
        
        Args:
            serializer: Validated Task serializer.
        """
        serializer.save()
        logger.info(
            f"Task updated: {serializer.instance.title} by user {self.request.user.username}"
        )

    def perform_destroy(self, instance):
        """
        Deletes a task and logs the action.
        
        Args:
            instance: Instance of Task to delete.
        """
        task_title = instance.title
        instance.delete()
        logger.info(
            f"Task deleted: {task_title} by user {self.request.user.username}"
        )

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name=QUERY_PARAMS['start_date'],
                description=f'Start date ({DATE_FORMAT_DISPLAY})',
                required=False,
                type=OpenApiTypes.DATE
            ),
            OpenApiParameter(
                name=QUERY_PARAMS['end_date'],
                description=f'End date ({DATE_FORMAT_DISPLAY})',
                required=False,
                type=OpenApiTypes.DATE
            ),
        ],
        responses={200: TaskSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Endpoint for filtering tasks by date range.
        
        Query parameters:
            start (str): Start date in format YYYY-MM-DD
            end (str): End date in format YYYY-MM-DD
            
        Returns:
            Response: List of tasks that meet the search criteria.
        """
        start = request.query_params.get(QUERY_PARAMS['start_date'], None)
        end = request.query_params.get(QUERY_PARAMS['end_date'], None)
        
        queryset = self.get_queryset()
        
        if start:
            try:
                start_date = datetime.strptime(start, DATE_FORMAT).date()
                queryset = queryset.filter(start_date__gte=start_date)
            except ValueError:
                logger.error(f"Invalid date format: {start}")
                return Response(
                    {"error": ERROR_MESSAGES['invalid_date_format']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if end:
            try:
                end_date = datetime.strptime(end, DATE_FORMAT).date()
                queryset = queryset.filter(Q(due_date__lte=end_date))
            except ValueError:
                logger.error(f"Invalid date format: {end}")
                return Response(
                    {"error": ERROR_MESSAGES['invalid_date_format']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
