from django.shortcuts import render

# Create your views here.
def edytor(request):
    return render(request, 'index.html')
