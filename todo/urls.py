"""
URL configuration for vink project.

The `urlpatterns` list routes URLs to views. For more information please see:
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
from todo import views


urlpatterns = [
    path('', views.main, name='main-todo'),
    path('tasks/add/', views.add_task),
    path('tasks/edit/', views.edit_task),
    path('tasks/delete/', views.delete_task),
    path('tasks/list/', views.list_tasks),

    path('projects/list/', views.list_projects),
    path('projects/add/', views.add_project),
    path('projects/edit/', views.edit_project),
    path('projects/delete/', views.delete_project),

    path('users/add/', views.add_user),
    path('users/edit/', views.edit_user),
    path('users/delete/', views.delete_user),
    path('users/list/', views.list_users),

    path('groupRequest/list/',   views.list_groupRequest),
    path('groupRequest/add/',    views.add_groupRequest),
    path('groupRequest/delete/', views.delete_groupRequest),
]
