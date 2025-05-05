from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserForProject

@receiver(post_save, sender=User)
def create_user_for_project(sender, instance, created, **kwargs):
    if created:
        UserForProject.objects.create(user=instance) 