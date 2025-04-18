from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .ai.apiconnect import ask_gpt

def edytor(request):
    return render(request, 'edytor/edytor.html')



@api_view(['POST'])
def chat_view(request):
    prompt = request.data.get("prompt", "")
    if not prompt:
        return Response({"error": "No prompt provided"}, status=400)

    result = ask_gpt(prompt)
    return Response({"response": result})
