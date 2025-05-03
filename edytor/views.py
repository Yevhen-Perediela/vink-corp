from django.shortcuts import render, redirect
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .ai.apiconnect import ask_gpt
from django.http import JsonResponse
from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import os
from todo.models import UserForProject

def edytor(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'edytor/edytor.html', {'user': request.user})

@api_view(['POST'])
def chat_view(request):
    prompt = request.data.get("prompt", "")
    code = request.data.get("code", "")

    if not prompt:
        return Response({"error": "No prompt provided"}, status=400)

    full_prompt = f"User message: {prompt}\n\nCurrent file content:\n{code}"

    try:
        response = ask_gpt(full_prompt)
        return Response({"response": response})
    except Exception as e:
        # return Response({"error": str(e)}, status=500)
        return JsonResponse({"error": str(e)}, status=500)



@csrf_exempt
def get_ascii_file(request):
    file_path = os.path.join(settings.BASE_DIR, 'edytor', 'asgii.txt')
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    return HttpResponse(content, content_type='text/plain')

def get_room_name(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    try:
        user_entry = UserForProject.objects.get(user=request.user)

        # ✅ Jeśli user ma friend_id → dołączamy do pokoju frienda
        if user_entry.friend_id:
            return JsonResponse({'room_name': f'chat_room_{user_entry.friend_id}'})

        # ✅ Jeśli user NIE ma friend_id, ale inni mają jego ID jako friend_id → on też jest właścicielem pokoju
        elif UserForProject.objects.filter(friend_id=request.user.id).exists():
            return JsonResponse({'room_name': f'chat_room_{request.user.id}'})

        # ❌ Brak przypisania
        return JsonResponse({'error': 'Brak przypisanego pokoju'}, status=400)

    except UserForProject.DoesNotExist:
        return JsonResponse({'error': 'UserForProject not found'}, status=404)