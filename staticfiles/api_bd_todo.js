
const BASE_URL = 'http://127.0.0.1:8000/todo';

async function addTask(taskData) {
    const response = await fetch(`${BASE_URL}/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
    return await response.json();
}

async function editTask(taskData) {
    const response = await fetch(`${BASE_URL}/edit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
    return await response.json();
}

async function deleteTask(taskId) {
    const response = await fetch(`${BASE_URL}/delete/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId })
    });
    return await response.json();
}

async function listTasks() {
    const response = await fetch(`${BASE_URL}/list/`);
    return await response.json();
}
