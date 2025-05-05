from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages

from main.auth.forms import RegisterForm
from django.contrib.auth.decorators import login_required
from todo.models import UserForProject
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from .forms import CustomPasswordChangeForm
import os
from django.utils.crypto import get_random_string
from django.conf import settings

def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            # UserForProject.objects.create(
            #     user=form.instance,
            #     friend_id=None
            # )
            messages.success(request, "Rejestracja zakończona sukcesem.")
            return redirect('login')
    else:
        form = RegisterForm()
    return render(request, 'register.html', {'form': form})

def login_view(request):
    error_message = None;
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            next_url = request.GET.get('next', 'edytor') 
            return redirect(next_url)
        else:
           error_message = "Nieprawidłowe dane logowania."
    return render(request, 'login.html', {'error_message': error_message})

def logout_view(request):
    logout(request)
    return redirect('login')


@login_required
def profile_view(request):
    if request.method == 'POST' and request.POST.get('password'):
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, form.user) 
            return redirect('profile')
    else:
        form = PasswordChangeForm(user=request.user)


    cur_user = UserForProject.objects.get(user_id=request.user.id)
    if request.method == 'POST' and request.FILES.get('avatar'):
        uploaded_file = request.FILES['avatar']
        file_ext = os.path.splitext(uploaded_file.name)[1]
        filename = f"{get_random_string(10)}{file_ext}"
        static_avatar_dir = os.path.join(settings.BASE_DIR, 'staticfiles', 'avatars')
        os.makedirs(static_avatar_dir, exist_ok=True)

        file_path = os.path.join(static_avatar_dir, filename)
        with open(file_path, 'wb+') as dest:
            for chunk in uploaded_file.chunks():
                dest.write(chunk)

        user_profile = cur_user
        user_profile.avatar = f'avatars/{filename}'  # ścieżka względem /static/
        user_profile.save()   

    all_users = UserForProject.objects.all()
    users_with_same_friend_id = all_users.filter(friend_id=cur_user.friend_id)
    users_with_user_as_friend = all_users.filter(friend_id=request.user.id)
    if cur_user.friend_id:
        try:
            op_user = UserForProject.objects.get(user_id=cur_user.friend_id)
        except UserForProject.DoesNotExist:
            op_user = None
    else:
        op_user = None

    if cur_user.friend_id:  
        team = list(users_with_same_friend_id) + list(users_with_user_as_friend) + [op_user]
        team = [user for user in team if user and user.user_id != request.user.id]
        team = list({user.id: user for user in team}.values())
    else:
        team = []

    if not team:
        team = None     

    return render(request, 'dashboard.html', {'user': request.user, 'team': team, 'form': form, 'ava': cur_user.avatar})


def todo_view(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'todo/templates/todo/index.html')

def welcome_view(request):
    return render(request, 'welcome.html')



