from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
import json
from .models import Task, Project, User, GroupRequest

def main(request):
    return render(request, 'todo/index.html')


@csrf_exempt
def list_tasks(request):
    if request.method == 'GET':
        project_id = request.GET.get('project_id')
        if project_id is not None:
            # filtrujemy po project_id
            tasks = Task.objects.filter(project_id=project_id)
        else:
            tasks = Task.objects.all()
        tasks_data = [model_to_dict(task) for task in tasks]
        return JsonResponse({'tasks': tasks_data})
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def add_task(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        text = data.get('text', '')
        due_date = data.get('due_date')  # w formacie 'YYYY-MM-DD'
        priority = data.get('priority', 'medium')
        progress = data.get('progress', 'to_do')
        project_id = data.get('project_id')
        assigned_user_id = data.get('assigned_user_id')

        # Sprawdź, czy użytkownik istnieje
        try:
            user = User.objects.get(id=assigned_user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        # Ustal właściwego właściciela (na podstawie friend_id)
        origin_user_id = user.friend_id if user.friend_id else user.id

        # Sprawdź, czy projekt istnieje i należy do tego właściciela
        try:
            project = Project.objects.get(id=project_id, origin_user_id=origin_user_id)
        except Project.DoesNotExist:
            return JsonResponse({'error': 'Project not found or access denied'}, status=404)

        # Utwórz zadanie
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
            if 'text' in data:
                task.text = data['text']
            if 'due_date' in data:
                task.due_date = data['due_date']
            if 'priority' in data:
                task.priority = data['priority']
            if 'progress' in data:
                task.progress = data['progress']
            if 'project_id' in data:
                task.project_id = data['project_id']
            if 'assigned_user_id' in data:
                task.assigned_user_id = data['assigned_user_id']

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
        if user_id:
            projects = Project.objects.filter(origin_user_id=user_id)
        else:
            projects = Project.objects.all()
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
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        # Logika wyboru właściciela projektu (zależnie od friend_id)
        origin_user_id = user.friend_id if user.friend_id else user.id

        try:
            origin_user = User.objects.get(id=origin_user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Origin user not found'}, status=404)

        # Tworzenie projektu
        project = Project.objects.create(name=name, origin_user=origin_user)

        return JsonResponse({'message': 'Project created', 'project_id': project.id})

    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def edit_project(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        project_id = data.get('id')

        try:
            project = Project.objects.get(id=project_id)
            
            if 'name' in data:
                project.name = data['name']
            
            if 'origin_user_id' in data:
                project.origin_user_id = data['origin_user_id']

            project.save()
            return JsonResponse({'message': 'Project updated'})
        except Project.DoesNotExist:
            return JsonResponse({'error': 'Project not found'}, status=404)
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

        user = User.objects.create(name=name)
        return JsonResponse({'message': 'User added', 'user_id': user.id})
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def list_users(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid method'}, status=405)

    users = User.objects.all()
    users_data = []
    for u in users:
        # model_to_dict już zwraca 'friend_id' bo masz pole IntegerField
        ud = model_to_dict(u)
        users_data.append({
            'id':        ud['id'],
            'name':      ud['name'],
            'friend_id': ud.get('friend_id')  # może być None
        })
    return JsonResponse({'users': users_data})

@csrf_exempt
def edit_user(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid method'}, status=405)

    data = json.loads(request.body)
    user_id   = data.get('id')
    friend_id = data.get('friend_id', None)  # może być int albo None

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    # aktualizujemy name, jeśli jest
    if 'name' in data:
        user.name = data['name']
    # aktualizujemy friend_id, jeśli jest (może być None)
    if 'friend_id' in data:
        user.friend_id = friend_id

    user.save()
    return JsonResponse({'message': 'User updated'})

@csrf_exempt
def delete_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('id')

        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return JsonResponse({'message': 'User deleted'})
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    return JsonResponse({'error': 'Invalid method'}, status=405)

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.forms.models import model_to_dict
import json
from .models import GroupRequest

@csrf_exempt
def list_groupRequest(request):
    if request.method == 'GET':
        group_requests = GroupRequest.objects.all()
        group_requests_data = [model_to_dict(gr) for gr in group_requests]
        return JsonResponse({'group_requests': group_requests_data})
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def add_groupRequest(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        from_id = data.get('from_id')
        to_id   = data.get('to_id')

        group_request = GroupRequest.objects.create(
            from_user_id=from_id,
            to_user_id=to_id
        )

        return JsonResponse({
            'message': 'GroupRequest added',
            'group_request_id': group_request.id
        })
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
