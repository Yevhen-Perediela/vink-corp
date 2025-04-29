from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from main.auth.forms import RegisterForm

def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Rejestracja zakończona sukcesem.")
            return redirect('login')
    else:
        form = RegisterForm()
    return render(request, 'register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('edytor')  # zmień na swoją stronę główną
        else:
            messages.error(request, "Nieprawidłowe dane logowania.")
    return render(request, 'login.html')

def logout_view(request):
    logout(request)
    return redirect('login')

def welcome(request):
    return render(request, 'welcome.html')