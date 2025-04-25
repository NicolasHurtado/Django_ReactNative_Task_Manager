from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from .serializers import EmailLoginSerializer, UserSerializer
from drf_spectacular.utils import extend_schema
import logging
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.exceptions import ValidationError

# Configure logger for debugging
logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for registering new users.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

    @extend_schema(
        description="Register a new user",
        request=UserSerializer,
        responses={201: UserSerializer},
    )
    def post(self, request):
        """
        Register a new user.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User registered: {serializer.data['username']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"User registration failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailLoginView(APIView):
    """
    API endpoint for user login with email.
    """

    permission_classes = [permissions.AllowAny]

    @extend_schema(
        description="Login with email",
        request=EmailLoginSerializer,
        responses={200: TokenObtainPairSerializer},
    )
    def post(self, request) -> Response:
        """
        Login with email and password.
        """
        email: str = request.data.get("email")
        password: str = request.data.get("password")

        if not email:
            raise ValidationError({"email": "Email is required"})
        if not password:
            raise ValidationError({"password": "Password is required"})

        # Find user by email
        user: User | None = User.objects.filter(email=email).first()

        if not user:
            logger.error(f"No user found with email: {email}")
            raise ValidationError({"email": "No account found with this email"})

        logger.info(f"User found with email: {email}")

        # Authenticate
        authenticated_user: User | None = authenticate(username=user.username, password=password)

        if not authenticated_user:
            logger.error(f"Incorrect password for email: {email}")
            raise ValidationError({"password": "Incorrect credentials"})

        # Generate tokens
        refresh: RefreshToken = RefreshToken.for_user(user)

        # Add user data to response
        user_serializer: UserSerializer = UserSerializer(user)

        response_data: dict = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": user_serializer.data,
        }

        logger.info(f"User logged in successfully: {user.username}")
        return Response(response_data, status=status.HTTP_200_OK)
