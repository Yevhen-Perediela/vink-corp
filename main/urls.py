#tutaj mają być tylko logowanie i rejestracja
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('todo/', views.todo_view, name='todo'),
    path('', views.welcome, name='welcome'),
]
