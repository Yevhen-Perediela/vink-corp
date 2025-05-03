from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class ChatMessage(models.Model):
    room_name = models.CharField(max_length=100)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender.username} w {self.room_name}: {self.message[:50]}"
