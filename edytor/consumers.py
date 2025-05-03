import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.http import JsonResponse
from .models import ChatMessage

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close()
            return

        room_name = await self.get_room_name(user)
        if not room_name:
            await self.close()
            return

        self.room_name = room_name
        self.room_group_name = room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Wysyłamy historię wiadomości po połączeniu
        messages = await self.get_messages()
        await self.send(text_data=json.dumps({
            'type': 'history',
            'messages': messages
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data["message"]
        username = self.scope["user"].username

        # Zapisz wiadomość w bazie danych
        await self.save_message(message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "username": username
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "username": event["username"]
        }))

    @database_sync_to_async
    def get_room_name(self, user):
        from todo.models import UserForProject

        try:
            user_entry = UserForProject.objects.get(user=user)

            if user_entry.friend_id:
                return f"chat_room_{user_entry.friend_id}"
            elif UserForProject.objects.filter(friend_id=user.id).exists():
                return f"chat_room_{user.id}"

            return None

        except UserForProject.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, message):
        ChatMessage.objects.create(
            room_name=self.room_name,
            sender=self.scope["user"],
            message=message
        )

    @database_sync_to_async
    def get_messages(self):
        messages = ChatMessage.objects.filter(room_name=self.room_name).order_by('timestamp')[:50]
        return [{
            'message': msg.message,
            'username': msg.sender.username,
            'timestamp': msg.timestamp.isoformat()
        } for msg in messages]
