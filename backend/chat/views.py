# chat/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from django.contrib.auth.models import User

# Widok do pobierania i tworzenia wiadomości czatu
class ChatMessageListCreateView(generics.ListCreateAPIView):
    queryset = ChatMessage.objects.all().order_by('-timestamp')
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Tutaj można zintegrować wywołanie API ChatGPT – na razie stub
        message_text = self.request.data.get('message', '')
        # Stub odpowiedzi (zastąpić integracją z API)
        ai_response = f"AI odpowiedź na: {message_text}"
        serializer.save(user=self.request.user, response=ai_response)

# Widok rejestracji użytkownika
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view

@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'User already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=username, password=password, email=email)
    token, created = Token.objects.get_or_create(user=user)
    return Response({'token': token.key})
