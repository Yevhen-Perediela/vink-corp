# Generated by Django 5.2 on 2025-05-04 20:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0012_userforproject_avatar_path'),
    ]

    operations = [
        migrations.RenameField(
            model_name='userforproject',
            old_name='avatar_path',
            new_name='avatar',
        ),
    ]
