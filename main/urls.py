"""
URL configuration for vink project.

The `urlpatterns` list routesyf URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.contrib import admin
from django.urls import path, include
from main.auth.views import login_view  # 👈 импорт твоего login_view

urlpatterns = [
    path('', login_view, name='home'),  # 👈 это главная страница — теперь login
    path('login/', login_view, name='login'),
    path('admin/', admin.site.urls),
    path('edytor/', include('edytor.urls')),
    path('todo/', include('todo.urls')),
]

