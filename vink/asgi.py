import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Konfiguracja Django musi być wykonana przed importem routingu
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vink.settings")
django.setup()

# Import routingu po konfiguracji Django
import edytor.routing
from django.core.asgi import get_asgi_application

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            edytor.routing.websocket_urlpatterns
        )
    ),
})
