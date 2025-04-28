import requests
from django.http import JsonResponse
import base64
import os
import subprocess
from django.views.decorators.csrf import csrf_exempt


def get_repo_tree(request):
    url = request.GET.get('url')
    if not url or 'github.com' not in url:
        return JsonResponse({'error': 'Nieprawidłowy link'}, status=400)

    try:
        _, _, user, repo = url.rstrip('/').split('/')[-4:]
    except:
        return JsonResponse({'error': 'Nie mogę odczytać repo z linku'}, status=400)

    # Pobieranie info o repo, żeby znać domyślny branch
    repo_info_url = f'https://api.github.com/repos/{user}/{repo}'
    repo_info_res = requests.get(repo_info_url)
    try:
        repo_info = repo_info_res.json()
        if not isinstance(repo_info, dict):
            raise Exception("Zła struktura JSON")
        branch = repo_info.get('default_branch', 'main')
    except Exception as e:
        print("Błąd repo_info:", e)
        return JsonResponse({'error': 'Nie można pobrać danych repo'}, status=500)

    # Pobieranie drzewa plików
    tree_url = f'https://api.github.com/repos/{user}/{repo}/git/trees/{branch}?recursive=1'
    r = requests.get(tree_url)
    if r.status_code != 200:
        return JsonResponse({'error': 'Nie można pobrać drzewa repo'}, status=400)

    try:
        try:
            tree_data = r.json()
            if 'tree' not in tree_data:
                print("Brak klucza 'tree' w odpowiedzi:", tree_data)
                return JsonResponse({'error': 'Odpowiedź nie zawiera struktury plików'}, status=500)
            return JsonResponse(tree_data['tree'], safe=False)
        except Exception as e:
            print("Błąd parsowania JSON z drzewa:", e)
            return JsonResponse({'error': 'Błąd danych drzewa'}, status=500)

    except Exception as e:
        print("Błąd parsowania JSON z drzewa:", e)
        return JsonResponse({'error': 'Błąd danych drzewa'}, status=500)


def get_file_from_github(request):
    user = request.GET.get('user')
    repo = request.GET.get('repo')
    filepath = request.GET.get('file', 'README.md')

    # automatyczne wykrywanie brancha
    repo_info_url = f'https://api.github.com/repos/{user}/{repo}'
    repo_info_res = requests.get(repo_info_url)
    try:
        repo_info = repo_info_res.json()
        if not isinstance(repo_info, dict):
            raise Exception("Zła struktura JSON")
        branch = repo_info.get('default_branch', 'main')
    except Exception as e:
        print("Błąd repo_info (file):", e)
        return JsonResponse({'error': 'Nie można pobrać danych repo'}, status=500)

    # pobranie pliku
    api_url = f"https://api.github.com/repos/{user}/{repo}/contents/{filepath}?ref={branch}"
    r = requests.get(api_url)
    if r.status_code != 200:
        print(f"Błąd pobierania pliku {filepath}: {r.status_code} - {r.text}")
        return JsonResponse({'error': 'Plik nie istnieje'}, status=404)

    data = r.json()
    content = base64.b64decode(data['content']).decode('utf-8')
    return JsonResponse({'filename': filepath, 'content': content})



@csrf_exempt
def clone_repo(request):
    import json
    data = json.loads(request.body)
    url = data.get('url')
    token = data.get('token')

    if not url or 'github.com' not in url:
        return JsonResponse({'error': 'Nieprawidłowy link'}, status=400)

    repo_name = url.rstrip('/').split('/')[-1]
    clone_path = f"/tmp/edytor_repos/{repo_name}"

    if os.path.exists(clone_path):
        return JsonResponse({'message': 'Repozytorium już istnieje lokalnie'}, status=200)

    # Jeśli użytkownik podał token, podstaw go do URL
    if token:
        url = url.replace('https://', f'https://{token}@')

    try:
        subprocess.run(["git", "clone", url, clone_path], check=True)
        return JsonResponse({'message': f'Sklonowano repo do {clone_path}'})
    except subprocess.CalledProcessError as e:
        print("Błąd klonowania:", e)
        return JsonResponse({'error': 'Błąd podczas klonowania repo'}, status=500)




@csrf_exempt
def local_repo_tree(request):
    repo = request.GET.get('repo')
    if not repo:
        return JsonResponse({'error': 'Brak repo'}, status=400)

    base_path = f"/tmp/edytor_repos/{repo}"

    if not os.path.exists(base_path):
        return JsonResponse({'error': 'Repozytorium nie istnieje lokalnie'}, status=404)

    tree = []
    for root, dirs, files in os.walk(base_path):
        rel_root = os.path.relpath(root, base_path)
        
        for dir in dirs:
            dir_path = os.path.join(rel_root, dir) if rel_root != '.' else dir
            tree.append({
                'path': dir_path.replace("\\", "/"),
                'type': 'tree'
            })

        for file in files:
            file_path = os.path.join(rel_root, file) if rel_root != '.' else file
            tree.append({
                'path': file_path.replace("\\", "/"),
                'type': 'blob'
            })

    return JsonResponse(tree, safe=False)

@csrf_exempt
def local_repo_file(request):
    repo = request.GET.get('repo')
    filepath = request.GET.get('file')

    if not repo or not filepath:
        return JsonResponse({'error': 'Brak repo lub pliku'}, status=400)

    base_path = f"/tmp/edytor_repos/{repo}"
    full_path = os.path.join(base_path, filepath)

    if not os.path.isfile(full_path):
        return JsonResponse({'error': 'Plik nie istnieje'}, status=404)

    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print("Błąd czytania pliku:", e)
        return JsonResponse({'error': 'Błąd odczytu pliku'}, status=500)

    return JsonResponse({'filename': filepath, 'content': content})





@csrf_exempt
def save_file(request):
    import json
    if request.method != 'POST':
        return JsonResponse({'error': 'Tylko metoda POST dozwolona'}, status=405)

    try:
        data = json.loads(request.body)
        repo = data.get('repo')
        filepath = data.get('file')
        content = data.get('content')

        if not repo or not filepath:
            return JsonResponse({'error': 'Brak repozytorium lub ścieżki pliku'}, status=400)

        base_path = f"/tmp/edytor_repos/{repo}"
        full_path = os.path.join(base_path, filepath)

        # upewnij się, że katalogi istnieją
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return JsonResponse({'success': True})
    
    except Exception as e:
        print("Błąd zapisu pliku:", e)
        return JsonResponse({'error': 'Błąd zapisu pliku'}, status=500)


@csrf_exempt
def create_file(request):
    import json
    data = json.loads(request.body)
    repo = data.get('repo')
    path = data.get('path')
    if not repo or not path:
        return JsonResponse({'error': 'Brak repozytorium lub ścieżki'}, status=400)

    path = path.lstrip('/')  # <-- USUŃ początkowy slash

    full_path = os.path.join(f"/tmp/edytor_repos/{repo}", path)

    try:
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write('')
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def create_folder(request):
    import json
    data = json.loads(request.body)
    repo = data.get('repo')
    path = data.get('path')
    if not repo or not path:
        return JsonResponse({'error': 'Brak repozytorium lub ścieżki'}, status=400)

    path = path.lstrip('/')  # <-- USUŃ początkowy slash

    full_path = os.path.join(f"/tmp/edytor_repos/{repo}", path)

    try:
        os.makedirs(full_path, exist_ok=True)
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def pull_repo(request):
    import json
    data = json.loads(request.body)
    repo = data.get('repo')

    if not repo:
        return JsonResponse({'error': 'Brak repozytorium do aktualizacji'}, status=400)

    repo_path = f"/tmp/edytor_repos/{repo}"

    if not os.path.exists(repo_path):
        return JsonResponse({'error': 'Repozytorium nie istnieje lokalnie'}, status=404)

    try:
        # Najpierw resetujemy wszystkie zmiany lokalne
        subprocess.run(["git", "-C", repo_path, "reset", "--hard"], check=True)
        subprocess.run(["git", "-C", repo_path, "pull"], check=True)
        return JsonResponse({'message': f'Pobrano najnowsze zmiany w {repo} (z automatycznym resetem)'})
    except subprocess.CalledProcessError as e:
        print("Błąd pullowania:", e)
        return JsonResponse({'error': 'Błąd podczas git pull (nawet po resecie)'}, status=500)


@csrf_exempt
def push_repo(request):
    import json
    data = json.loads(request.body)
    repo = data.get('repo')
    message = data.get('message', 'Zmiany przez edytor')  # Domyślny komunikat commit'a

    if not repo:
        return JsonResponse({'error': 'Brak repozytorium do wypchnięcia'}, status=400)

    repo_path = f"/tmp/edytor_repos/{repo}"

    if not os.path.exists(repo_path):
        return JsonResponse({'error': 'Repozytorium nie istnieje lokalnie'}, status=404)

    try:
        # Dodaj wszystkie zmiany
        subprocess.run(["git", "-C", repo_path, "add", "."], check=True)

        # Sprawdź, czy są jakieś zmiany do commitowania
        result = subprocess.run(["git", "-C", repo_path, "status", "--porcelain"], capture_output=True, text=True)
        if result.stdout.strip() == "":
            return JsonResponse({'message': 'Brak zmian do wypchnięcia'})

        # Jeśli są zmiany - zrób commit
        subprocess.run(["git", "-C", repo_path, "commit", "-m", message], check=True)

        # Wypchnij zmiany
        subprocess.run(["git", "-C", repo_path, "push"], check=True)

        return JsonResponse({'message': f'Zmiany zostały wypchnięte do {repo} 🚀'})
    except subprocess.CalledProcessError as e:
        print("Błąd pushowania:", e)
        return JsonResponse({'error': 'Błąd podczas pushowania repozytorium'}, status=500)
