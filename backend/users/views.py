from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import UserSerializer
from drf_spectacular.utils import extend_schema


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
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
