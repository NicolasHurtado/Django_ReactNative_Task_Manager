import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.test import APIClient
from typing import Callable

from constants import ID_STR, PASSWORD_CONFIRM_STR, PASSWORD_STR, USERNAME_STR, EMAIL_STR, FIRST_NAME_STR, LAST_NAME_STR


@pytest.mark.django_db
class TestUserAPI:
    @pytest.fixture(autouse=True)
    def setup(self, api_client: APIClient) -> None:
        """Initial setup for all tests"""
        self.client = api_client
        self.register_url = reverse("register")
        self.valid_user_data: dict[str, str] = {
            USERNAME_STR: "testuser",
            EMAIL_STR: "test@example.com",
            FIRST_NAME_STR: "Test",
            LAST_NAME_STR: "User",
            PASSWORD_STR: "StrongP@ssw0rd",
            PASSWORD_CONFIRM_STR: "StrongP@ssw0rd",
        }

    def test_register_valid_user(self) -> None:
        """Test registering a user with valid data."""
        response: Response = self.client.post(self.register_url, self.valid_user_data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert ID_STR in response.data
        assert response.data[USERNAME_STR] == self.valid_user_data[USERNAME_STR]
        assert response.data[EMAIL_STR] == self.valid_user_data[EMAIL_STR]
        assert response.data[FIRST_NAME_STR] == self.valid_user_data[FIRST_NAME_STR]
        assert response.data[LAST_NAME_STR] == self.valid_user_data[LAST_NAME_STR]

        # Verify user exists in database
        user_exists: bool = User.objects.filter(username=self.valid_user_data[USERNAME_STR]).exists()
        assert user_exists is True

        # Password should not be returned in response
        assert PASSWORD_STR not in response.data
        assert PASSWORD_CONFIRM_STR not in response.data

    def test_register_password_mismatch(self) -> None:
        """Test registering with mismatched passwords."""
        invalid_data = self.valid_user_data.copy()
        invalid_data[PASSWORD_CONFIRM_STR] = "DifferentPassword"

        response: Response = self.client.post(self.register_url, invalid_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert PASSWORD_STR in response.data

        # Confirm user wasn't created
        user_exists: bool = User.objects.filter(username=invalid_data[USERNAME_STR]).exists()
        assert user_exists is False

    def test_register_weak_password(self) -> None:
        """Test registering with a weak password."""
        invalid_data: dict[str, str] = self.valid_user_data.copy()
        invalid_data[PASSWORD_STR] = "123456"
        invalid_data[PASSWORD_CONFIRM_STR] = "123456"

        response: Response = self.client.post(self.register_url, invalid_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert PASSWORD_STR in response.data

        # Confirm user wasn't created
        user_exists: bool = User.objects.filter(username=invalid_data[USERNAME_STR]).exists()
        assert user_exists is False

    def test_register_duplicate_username(self, user_factory: Callable) -> None:
        """Test registering with an existing username."""
        # First create a user using the factory
        user_factory(
            username=self.valid_user_data[USERNAME_STR],
            email="existing@example.com",
        )

        # Try creating another with the same username
        response: Response = self.client.post(self.register_url, self.valid_user_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert USERNAME_STR in response.data

        # Verify only one user exists with this username
        user_count: int = User.objects.filter(username=self.valid_user_data[USERNAME_STR]).count()
        assert user_count == 1

    def test_register_missing_required_fields(self) -> None:
        """Test registering without required fields."""
        incomplete_data: dict[str, str] = {
            EMAIL_STR: "incomplete@example.com",
            FIRST_NAME_STR: "Incomplete",
        }

        response: Response = self.client.post(self.register_url, incomplete_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        # These required fields should be reported missing
        assert USERNAME_STR in response.data
        assert PASSWORD_STR in response.data
        assert PASSWORD_CONFIRM_STR in response.data

    def test_register_invalid_email(self) -> None:
        """Test registering with invalid email format."""
        invalid_data: dict[str, str] = self.valid_user_data.copy()
        invalid_data[EMAIL_STR] = "not-an-email"

        response: Response = self.client.post(self.register_url, invalid_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert EMAIL_STR in response.data

    def test_register_without_optional_fields(self) -> None:
        """Test registering without optional fields (first_name, last_name)."""
        minimal_data: dict[str, str] = {
            USERNAME_STR: "minimaluser",
            EMAIL_STR: "minimal@example.com",
            PASSWORD_STR: "StrongP@ssw0rd",
            PASSWORD_CONFIRM_STR: "StrongP@ssw0rd",
        }

        response: Response = self.client.post(self.register_url, minimal_data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data[USERNAME_STR] == minimal_data[USERNAME_STR]
        assert response.data[FIRST_NAME_STR] == ""
        assert response.data[LAST_NAME_STR] == ""

        # Verify user exists in database
        user: User = User.objects.get(username=minimal_data[USERNAME_STR])
        assert user is not None
        assert user.first_name == ""
        assert user.last_name == ""

    def test_login_with_email(self) -> None:
        """Test logging in with email."""
        # Register a user so the password is stored correctly
        register_data = {
            USERNAME_STR: "UserLogin",
            EMAIL_STR: "userlogin@example.com",
            FIRST_NAME_STR: "User",
            LAST_NAME_STR: "Login",
            PASSWORD_STR: "UserLogin123",
            PASSWORD_CONFIRM_STR: "UserLogin123",
        }

        # Register the user
        self.client.post(self.register_url, register_data, format="json")

        # Try to login
        login_data = {
            EMAIL_STR: register_data[EMAIL_STR],
            PASSWORD_STR: register_data[PASSWORD_STR],
        }

        response: Response = self.client.post(reverse("login"), login_data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data
