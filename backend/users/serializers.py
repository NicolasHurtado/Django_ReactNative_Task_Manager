from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email as django_validate_email
import logging

logger = logging.getLogger(__name__)


class EmailLoginSerializer(serializers.Serializer):
    """
    Simple serializer for email login.
    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, style={"input_type": "password"})


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={"input_type": "password"})
    password_confirm = serializers.CharField(write_only=True, required=True, style={"input_type": "password"})
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
        ]
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
            "email": {"required": True, "validators": []},  # Quitamos validadores por defecto para personalizar
            "password": {"write_only": True},
            "password_confirm": {"write_only": True},
        }

    def validate_email(self, value):
        """
        Verifica que el correo electrónico sea válido y único.
        """
        # Validar formato de email
        try:
            django_validate_email(value)
        except ValidationError as e:
            logger.error(f"Formato de email inválido: {value}, error: {str(e)}")
            raise serializers.ValidationError("Por favor ingrese un correo electrónico válido.")

        # Verificar que el email sea único
        if User.objects.filter(email=value).exists():
            logger.warning(f"Intento de registro con email ya existente: {value}")
            raise serializers.ValidationError("Este correo electrónico ya está en uso.")

        return value

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password_confirm"):
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})

        try:
            validate_password(attrs.get("password"))
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})

        # Verificar que el username sea único
        username = attrs.get("username")
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "Este nombre de usuario ya está en uso."})

        return attrs

    def create(self, validated_data):
        # Eliminar password_confirm ya que no es parte de User
        validated_data.pop("password_confirm")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],  # Ahora es obligatorio
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            password=validated_data["password"],
        )

        logger.info(f"Usuario creado correctamente: {user.username}, email: {user.email}")
        return user
