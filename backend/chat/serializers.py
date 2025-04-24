# chat/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ChatMessage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'message', 'response', 'timestamp']
