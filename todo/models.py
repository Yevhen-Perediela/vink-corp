from django.db import models
from django.contrib.auth.models import User

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
    

class UserForProject(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    friend_id = models.IntegerField(null=True, blank=True)
    avatar = models.CharField(max_length=255, default='avatars/avatar.png')

    def __str__(self):
        return self.user.username
    
class Project(models.Model):
    name = models.CharField(max_length=200)
    origin_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='projects',
        null=True,
        blank=True
    )
    def __str__(self):
        return self.name

class GroupRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username}"
