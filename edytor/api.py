import requests
from django.http import JsonResponse
import base64

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
        tree_data = r.json()
        return JsonResponse(tree_data.get('tree', []), safe=False)
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
