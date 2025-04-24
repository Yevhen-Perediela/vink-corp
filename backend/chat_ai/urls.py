"""
URL configuration for chat_ai project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# chat_ai/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as drf_views
from chat.views import register

from django.http import HttpResponse

def home(request):
    return HttpResponse("Witamy w projekcie Chatbox AI!")

urlpatterns = [
    path('', home, name='home'),  # Dodana ścieżka dla strony głównej
    path('admin/', admin.site.urls),
    path('api/token/', drf_views.obtain_auth_token, name='api-token'),
    path('api/register/', register, name='register'),
    path('api/chat/', include('chat.urls')),
]
