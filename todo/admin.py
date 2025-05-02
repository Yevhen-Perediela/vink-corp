from django.contrib import admin
from .models import Task, Project, User, GroupRequest

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'priority', 'progress', 'due_date', 'project_id', 'assigned_user_id', 'created_at')
    list_filter = ('priority', 'progress')
    search_fields = ('text',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'origin_user_id')

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'friend_id')

@admin.register(GroupRequest)
class GroupRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'from_user', 'to_user')