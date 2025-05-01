
const BASE_URL = 'http://127.0.0.1:8000/todo/tasks';

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

async function listTasks(projectId = null) {
    const url = projectId
        ? `${BASE_URL}/list/?project_id=${projectId}`
        : `${BASE_URL}/list/`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

export { addTask, editTask, deleteTask, listTasks };