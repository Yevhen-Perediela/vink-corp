from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'priority', 'progress', 'due_date', 'project_id', 'assigned_user_id', 'created_at')
    list_filter = ('priority', 'progress')
    search_fields = ('text',)
