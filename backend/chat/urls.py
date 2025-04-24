# chat/urls.py
from django.urls import path
from .views import ChatMessageListCreateView

urlpatterns = [
    path('', ChatMessageListCreateView.as_view(), name='chat-messages'),
]
