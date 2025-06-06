from django.urls import path
from .views import RegisterView, EmailLoginView, UserView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailLoginView.as_view(), name="login"),
    path("users/", UserView.as_view(), name="users"),
]
