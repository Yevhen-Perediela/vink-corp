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
from . import views
from .api import clone_repo, local_repo_tree, local_repo_file, save_file, create_file, create_folder, pull_repo, push_repo, get_commit_history


urlpatterns = [
    path('', views.edytor, name='edytor'),
    path('api/local-tree/', local_repo_tree, name='local_repo_tree'),
    path('api/local-file/', local_repo_file, name='local_repo_file'),
    path('ai/apiconnect/', views.chat_view, name='chat_view'),
    path('api/clone-repo/', clone_repo, name='clone_repo'),
    path('api/save-file/', save_file, name='save_file'), 
    path('api/create-file/', create_file, name='create_file'),
    path('api/create-folder/', create_folder, name='create_folder'),
    path('api/pull-repo/', pull_repo, name='pull_repo'),
    path('api/push-repo/', push_repo, name='push_repo'),
    path('api/commit-history/', get_commit_history, name='commit_history'),
]
