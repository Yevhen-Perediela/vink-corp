from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
from django.contrib.auth.models import User
import json
from .models import Task, Project, UserForProject, GroupRequest

def main(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'todo/index.html')


@csrf_exempt
def list_tasks(request):
    if request.method == 'GET':
        project_id = request.GET.get('project_id')
        tasks = Task.objects.filter(project_id=project_id) if project_id else Task.objects.all()
        tasks_data = [model_to_dict(task) for task in tasks]
        return JsonResponse({'tasks': tasks_data})
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def add_task(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        text = data.get('text', '')
        due_date = data.get('due_date')
        priority = data.get('priority', 'medium')
        progress = data.get('progress', 'to_do')
        project_id = data.get('project_id')
        assigned_user_id = data.get('assigned_user_id')

        try:
            user = UserForProject.objects.get(id=assigned_user_id)
        except UserForProject.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        origin_user_id = user.friend_id if user.friend_id else user.id

        try:
            project = Project.objects.get(id=project_id, origin_user_id=origin_user_id)
        except Project.DoesNotExist:
            return JsonResponse({'error': 'Project not found or access denied'}, status=404)

        task = Task.objects.create(
            text=text,
            due_date=due_date,
            priority=priority,
            progress=progress,
            project_id=project_id,
            assigned_user_id=assigned_user_id
        )

        return JsonResponse({'message': 'Task added', 'task_id': task.id})

    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def edit_task(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        task_id = data.get('id')

        try:
            task = Task.objects.get(id=task_id)
            task.text = data.get('text', task.text)
            task.due_date = data.get('due_date', task.due_date)
            task.priority = data.get('priority', task.priority)
            task.progress = data.get('progress', task.progress)
            task.project_id = data.get('project_id', task.project_id)
            task.assigned_user_id = data.get('assigned_user_id', task.assigned_user_id)
            task.save()
            return JsonResponse({'message': 'Task updated'})
        except Task.DoesNotExist:
            return JsonResponse({'error': 'Task not found'}, status=404)
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def delete_task(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        task_id = data.get('id')

        try:
            task = Task.objects.get(id=task_id)
            task.delete()
            return JsonResponse({'message': 'Task deleted'})
        except Task.DoesNotExist:
            return JsonResponse({'error': 'Task not found'}, status=404)
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def list_projects(request):
    if request.method == 'GET':
        user_id = request.GET.get('origin_user_id')
        projects = Project.objects.filter(origin_user_id=user_id) if user_id else Project.objects.all()
        projects_data = [model_to_dict(p, fields=['id', 'name', 'origin_user_id']) for p in projects]
        return JsonResponse({'projects': projects_data})
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def add_project(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        user_id = data.get('user_id')

        try:
            user = UserForProject.objects.get(id=user_id)
        except UserForProject.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        origin_user_id = user.friend_id if user.friend_id else user.id

        try:
            origin_user = UserForProject.objects.get(id=origin_user_id)
        except UserForProject.DoesNotExist:
            return JsonResponse({'error': 'Origin user not found'}, status=404)

        project = Project.objects.create(name=name, origin_user=origin_user.user)

        return JsonResponse({'message': 'Project created', 'project_id': project.id})

    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def edit_project(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        project_id = data.get('id')

        try:
            project = Project.objects.get(id=project_id)
            project.name = data.get('name', project.name)
            origin_user_id = data.get('origin_user_id')
            if origin_user_id:
                origin_user = UserForProject.objects.get(id=origin_user_id)
                project.origin_user = origin_user.user
            project.save()
            return JsonResponse({'message': 'Project updated'})
        except (Project.DoesNotExist, UserForProject.DoesNotExist):
            return JsonResponse({'error': 'Project or user not found'}, status=404)
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def delete_project(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        project_id = data.get('id')

        try:
            project = Project.objects.get(id=project_id)
            project.delete()
            return JsonResponse({'message': 'Project deleted'})
        except Project.DoesNotExist:
            return JsonResponse({'error': 'Project not found'}, status=404)
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def add_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name', '')

        user = User.objects.create(username=name)
        custom_user = UserForProject.objects.create(user=user)
        return JsonResponse({'message': 'User added', 'user_id': custom_user.id})
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def list_users(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid method'}, status=405)

    user_id = request.GET.get('id')

    if user_id:
        try:
            user = UserForProject.objects.select_related('user').get(id=user_id)
            return JsonResponse({
                'users': [{
                    'id': user.id,
                    'name': user.user.username,
                    'friend_id': user.friend_id
                }]
            })
        except UserForProject.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

    # Fallback – zwróć wszystkich użytkowników
    users = UserForProject.objects.select_related('user').all()
    users_data = [{
        'id': u.id,
        'name': u.user.username,
        'friend_id': u.friend_id
    } for u in users]

    return JsonResponse({'users': users_data})


@csrf_exempt
def edit_user(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid method'}, status=405)

    data = json.loads(request.body)
    user_id = data.get('id')
    friend_id = data.get('friend_id', None)

    try:
        user = UserForProject.objects.select_related('user').get(id=user_id)
        if 'name' in data:
            user.user.username = data['name']
            user.user.save()
        user.friend_id = friend_id
        user.save()
        return JsonResponse({'message': 'User updated'})
    except UserForProject.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)


@csrf_exempt
def delete_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('id')

        try:
            user = UserForProject.objects.get(id=user_id)
            user.user.delete()
            user.delete()
            return JsonResponse({'message': 'User deleted'})
        except UserForProject.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def list_groupRequest(request):
    if request.method == 'GET':
        group_requests = GroupRequest.objects.select_related('from_user', 'to_user').all()
        group_requests_data = [
            {
                'id': gr.id,
                'from_id': gr.from_user.id,
                'to_id': gr.to_user.id,
                'from_name': gr.from_user.username,
                'to_name': gr.to_user.username
            } for gr in group_requests
        ]
        return JsonResponse({'group_requests': group_requests_data})
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def add_groupRequest(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        from_id = data.get('from_id')
        to_id = data.get('to_id')

        try:
            from_user = UserForProject.objects.get(id=from_id)
            to_user = UserForProject.objects.get(id=to_id)
            group_request = GroupRequest.objects.create(
                from_user=from_user.user,  
                to_user=to_user.user     
            )

            return JsonResponse({'message': 'GroupRequest added', 'group_request_id': group_request.id})
        except UserForProject.DoesNotExist:
            return JsonResponse({'error': 'Invalid user(s)'}, status=404)
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def delete_groupRequest(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        request_id = data.get('id')

        try:
            group_request = GroupRequest.objects.get(id=request_id)
            group_request.delete()
            return JsonResponse({'message': 'GroupRequest deleted'})
        except GroupRequest.DoesNotExist:
            return JsonResponse({'error': 'GroupRequest not found'}, status=404)
    return JsonResponse({'error': 'Invalid method'}, status=405)
