from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class RegisterForm(UserCreationForm):
    username = forms.CharField(
        required=True,
        help_text='',
        label='Nazwa użytkownika',
        widget=forms.TextInput
    )

    password1 = forms.CharField(
        required=True,
        label="Hasło",
        widget=forms.PasswordInput,
        help_text='',
    )

    email = forms.EmailField(
        required=True,
        help_text='',
        label='E-mail',
        widget=forms.EmailInput,
    )

    password2 = forms.CharField(
        required=True,
        label="Powtórz hasło",
        widget=forms.PasswordInput,
        help_text='',
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
        help_texts = {
            'username': '',
            'email': '',
            'password1': '',
            'password2': '',
        }