from django.db import models

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    PROGRESS_CHOICES = [
        ('to_do', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]

    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)  # Na kiedy trzeba zrobić
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low')
    progress = models.CharField(max_length=20, choices=PROGRESS_CHOICES, default='to_do')
    project_id = models.IntegerField(null=True, blank=True)  # ID projektu
    assigned_user_id = models.IntegerField(null=True, blank=True)  # ID użytkownika wykonującego

    def __str__(self):
        return self.text
