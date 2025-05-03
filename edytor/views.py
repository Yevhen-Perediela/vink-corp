from django.shortcuts import render, redirect
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .ai.apiconnect import ask_gpt
from django.http import JsonResponse


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

