from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
import json
from .models import Task

def main(request):
    return render(request, 'todo/index.html')


@csrf_exempt
def list_tasks(request):
    if request.method == 'GET':
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
        priority = data.get('priority', 'medium')  # domyślnie medium
        progress = data.get('progress', 'to_do')  # domyślnie to_do
        project_id = data.get('project_id')
        assigned_user_id = data.get('assigned_user_id')

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
