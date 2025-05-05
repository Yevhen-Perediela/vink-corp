from django import forms
from django.contrib.auth.forms import PasswordChangeForm

class CustomPasswordChangeForm(PasswordChangeForm):
    error_messages = {
        'password_mismatch': 'Hasła nie są takie same.',
        'password_too_common': 'Podane hasło jest zbyt powszechne.',
        'password_violation': 'Hasło nie spełnia wymagań bezpieczeństwa.',
    }

    def clean_new_password1(self):
        new_password1 = self.cleaned_data.get("new_password1")
        return new_password1
