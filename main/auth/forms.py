from django import forms


class LoginForm(forms.Form):
    username = forms.CharField(required=True, label='Nazwa użytkownika')
    password = forms.CharField(required=True, label='Hasło', widget=forms.PasswordInput)