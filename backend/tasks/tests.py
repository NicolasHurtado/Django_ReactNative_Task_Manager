import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.test import APIClient
from datetime import date, timedelta
from typing import List, Tuple, Callable
from tasks.models import Task
from tasks.constants import ERROR_MESSAGES, QUERY_PARAMS


@pytest.mark.django_db  # Necesario para acceder a la base de datos
class TestTaskAPI:
    @pytest.fixture(autouse=True)
    def setup(self, authenticated_client: Tuple[APIClient, User], task_factory: Callable) -> None:
        """Initial setup for all tests"""
        # Unpack the authenticated client and user
        self.client, self.user = authenticated_client

        # Dates for testing
        self.today: date = date.today()
        self.tomorrow: date = self.today + timedelta(days=1)
        self.yesterday: date = self.today - timedelta(days=1)

        # Create a test task using the factory
        self.task: Task = task_factory(
            title="Initial test task",
            description="Test description",
            start_date=self.today,
            due_date=self.tomorrow,
            user=self.user,
        )

        # URLs
        self.task_list_url: str = reverse("task-list")

    def test_get_task_list(self) -> None:
        """Test that user tasks can be retrieved."""
        response: Response = self.client.get(self.task_list_url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == self.task.title

    def test_create_task(self, user_factory: Callable) -> None:
        """Test that a task can be created."""
        # Get data from fixture
        other_user: User = user_factory(username="testuser2")
        data: dict = {
            "title": "New task",
            "description": "New description",
            "start_date": date.today().isoformat(),
            "due_date": (date.today() + timedelta(days=1)).isoformat(),
            "completed": False,
            "user": other_user.id,
        }
        # Create the task
        response: Response = self.client.post(self.task_list_url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        # Verify that the task was assigned to the current authenticated user
        new_task: Task = Task.objects.get(id=response.data["id"])
        assert new_task.title == "New task"
        assert new_task.user == self.user
        assert new_task.user != other_user

    def test_update_task(self, task_factory: Callable) -> None:
        """Test that a task can be updated."""
        # Get dedicated task for this test
        task: Task = task_factory(
            title="Task to update",
            description="This task will be updated",
            start_date=date.today(),
            due_date=date.today() + timedelta(days=1),
            user=self.user,
        )

        task_detail_url: str = reverse("task-detail", kwargs={"pk": task.id})
        updated_data: dict = {
            "title": "Updated task",
            "description": "Updated description",
            "start_date": str(self.today),
            "due_date": str(self.tomorrow),
            "completed": True,
        }
        response: Response = self.client.patch(task_detail_url, updated_data, format="json")
        assert response.status_code == status.HTTP_200_OK

        # Refresh from database and verify changes
        task.refresh_from_db()
        assert task.title == "Updated task"
        assert task.completed is True

    def task_for_deletion(self, task_factory: Callable) -> Task:
        """Create a task specifically for deletion test."""
        task_instance: Task = task_factory(
            title="Task to delete",
            description="This task will be deleted",
            start_date=date.today(),
            due_date=date.today() + timedelta(days=1),
            user=self.user,
        )
        return task_instance

    def test_delete_task(self, task_factory: Callable) -> None:
        """Test that a task can be deleted."""
        task: Task = task_factory(
            title="Task to delete",
            description="This task will be deleted",
            start_date=date.today(),
            due_date=date.today() + timedelta(days=1),
            user=self.user,
        )

        response: Response = self.client.delete(reverse("task-detail", kwargs={"pk": task.id}))

        assert response.status_code == status.HTTP_204_NO_CONTENT
        with pytest.raises(Task.DoesNotExist):
            Task.objects.get(id=task.id)

    @pytest.fixture
    def setup_filtering_tasks(self, task_factory: Callable) -> List[Task]:
        """Create tasks with different dates for filtering tests."""
        # Create a future task
        future_date: date = date.today() + timedelta(days=10)
        future_task: Task = task_factory(
            title="Future task",
            start_date=future_date,
            due_date=future_date + timedelta(days=1),
            user=self.user,
        )

        # Create a task for tomorrow
        tomorrow_date: date = date.today() + timedelta(days=1)
        tomorrow_task: Task = task_factory(
            title="Tomorrow task",
            start_date=tomorrow_date,
            due_date=tomorrow_date + timedelta(days=1),
            user=self.user,
        )

        return [future_task, tomorrow_task]

    def test_task_filtering(self, setup_filtering_tasks: List[Task]) -> None:
        """Test filtering tasks by date range."""
        # Get the tasks created in the fixture
        future_task, tomorrow_task = setup_filtering_tasks
        next_week: date = self.today + timedelta(days=7)

        # Filter by date range (today to next week)
        search_url: str = (
            f"{self.task_list_url}search/?"
            f"{QUERY_PARAMS['start_date']}={self.today}&"
            f"{QUERY_PARAMS['end_date']}={next_week}"
        )
        response: Response = self.client.get(search_url)
        print(response.data)

        assert response.status_code == status.HTTP_200_OK
        task_titles: List[str] = [task["title"] for task in response.data]

        # The initial task from setup should be in the results
        assert "Initial test task" in task_titles
        # Tomorrow's task should be in results as it starts after tomorrow
        assert tomorrow_task.title in task_titles
        # Future task should not be in results as it starts after tomorrow
        assert future_task.title not in task_titles

    def test_invalid_start_date_format(self) -> None:
        """Test that the API correctly handles an invalid start date format."""
        # Use an incorrect date format for start
        search_url: str = (
            f"{self.task_list_url}search/?"
            f"{QUERY_PARAMS['start_date']}=01-01-2025&"
            f"{QUERY_PARAMS['end_date']}={self.tomorrow}"
        )
        response: Response = self.client.get(search_url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data
        assert ERROR_MESSAGES["invalid_date_format"] in response.data["error"]

    def test_invalid_end_date_format(self) -> None:
        """Test that the API correctly handles an invalid end date format."""
        # Use a correct date format for start but incorrect for end
        search_url: str = (
            f"{self.task_list_url}search/?"
            f"{QUERY_PARAMS['start_date']}={self.today}&"
            f"{QUERY_PARAMS['end_date']}=01/01/2025"
        )
        response: Response = self.client.get(search_url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data
        assert ERROR_MESSAGES["invalid_date_format"] in response.data["error"]

    def test_both_invalid_date_formats(self) -> None:
        """Test that the API correctly handles invalid formats for both dates."""
        # Both formats incorrect (should fail on the first one found - start)
        search_url: str = (
            f"{self.task_list_url}search/?"
            f"{QUERY_PARAMS['start_date']}=2025/01/01&"
            f"{QUERY_PARAMS['end_date']}=01/01/2025"
        )
        response: Response = self.client.get(search_url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data
        assert ERROR_MESSAGES["invalid_date_format"] in response.data["error"]

    def test_validate_due_date_before_start_date(self) -> None:
        """Test validation of due date before start date."""
        # Try to create a task with a due date before the start date
        data: dict = {
            "title": "Invalid task dates",
            "description": "This task has a due date before the start date",
            "start_date": self.tomorrow.isoformat(),  # Tomorrow
            "due_date": self.today.isoformat(),  # Today (is before tomorrow)
            "user": self.user.id,
        }

        response: Response = self.client.post(self.task_list_url, data, format="json")

        # Verify that the API rejects the request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "due_date" in response.data
        assert ERROR_MESSAGES["due_date_before_start"] in response.data["due_date"]

    def test_validate_task_overlap(self, task_factory: Callable) -> None:
        """Test validation to avoid task overlap."""
        # First, create an existing task that occupies a specific period
        task_factory(
            title="Existing task",
            description="This task already occupies a period of time",
            start_date=date(2025, 1, 1),
            due_date=date(2025, 1, 10),
            user=self.user,
        )

        # Try to create a task that overlaps with the existing one
        data: dict = {
            "title": "Overlapping task",
            "description": "This task overlaps with another existing task",
            "start_date": "2025-01-05",
            "due_date": "2025-01-15",
            "user": self.user.id,
        }

        response: Response = self.client.post(self.task_list_url, data, format="json")

        # Verify that the API rejects the request due to overlap
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "start_date" in response.data
        assert ERROR_MESSAGES["task_overlap"] in response.data["start_date"]

    def test_validate_task_without_due_date_overlap(self, task_factory: Callable) -> None:
        """Test validation for tasks without due date set."""
        # Create a task without due date
        task_factory(
            title="Task without due date",
            description="This task does not have a due date",
            start_date=date(2025, 2, 1),
            due_date=None,
            user=self.user,
        )

        # Try to create a task that starts after the start date of the first task
        data: dict = {
            "title": "Another task in February",
            "description": "This task should overlap with the task without a due date",
            "start_date": "2025-02-10",
            "due_date": "2025-02-15",
            "user": self.user.id,
        }

        response: Response = self.client.post(self.task_list_url, data, format="json")

        # Verify that the API rejects the request due to overlap
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "start_date" in response.data
        assert ERROR_MESSAGES["task_overlap"] in response.data["start_date"]

    def test_update_task_no_overlap_validation(self, task_factory: Callable) -> None:
        """Test that verifies that a task can be updated without activating the overlap validation."""
        # Create a task to update
        task: Task = task_factory(
            title="Task to update",
            description="This task will be updated without changing dates",
            start_date=date(2025, 3, 1),
            due_date=date(2025, 3, 10),
            user=self.user,
        )

        # Update the same task without changing dates (should not activate validation)
        task_detail_url: str = reverse("task-detail", kwargs={"pk": task.id})
        updated_data: dict = {
            "title": "Updated title",
            "description": "Updated description",
            "start_date": "2025-03-01",
            "due_date": "2025-03-10",
        }

        response: Response = self.client.patch(task_detail_url, updated_data, format="json")

        # The update should be successful
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Updated title"
