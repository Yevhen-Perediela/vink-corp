const PROJECTS_URL = 'http://127.0.0.1:8000/todo/projects';
const USERS_URL = 'http://127.0.0.1:8000/todo/users';

async function getUserById(userId) {
    const response = await fetch(`${USERS_URL}/list/`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log('Users list response:', data);

    if (!data.users || !Array.isArray(data.users)) {
        throw new Error('Invalid response format from server');
    }

    const user = data.users.find(u => u.id === userId);
    console.log('Looking for user ID:', userId);
    console.log('Found user:', user);

    if (!user) {
        throw new Error(`User with ID ${userId} not found`);
    }

    return user;
}

async function addProject(projectData) {
    const response = await fetch(`${PROJECTS_URL}/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    });
    return await response.json();
}

async function editProject(projectData) {
    const response = await fetch(`${PROJECTS_URL}/edit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    });
    return await response.json();
}

async function deleteProject(projectId) {
    const response = await fetch(`${PROJECTS_URL}/delete/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId })
    });
    return await response.json();
}

async function listProjects(userId = null) {
    const user = await getUserById(userId);
    const effectiveUserId = user.friend_id ?? user.id;

    const url = `${PROJECTS_URL}/list/?origin_user_id=${effectiveUserId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

// Eksport:
export { addProject, editProject, deleteProject, listProjects };