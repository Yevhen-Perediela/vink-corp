const USERS_URL = 'http://127.0.0.1:8000/todo/users';

async function addUser(userData) {
    const response = await fetch(`${USERS_URL}/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return await response.json();
}

async function editUser(userData) {
    const response = await fetch(`${USERS_URL}/edit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return await response.json();
}

async function deleteUser(userId) {
    const response = await fetch(`${USERS_URL}/delete/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
    });
    return await response.json();
}

async function listUsers() {
    const response = await fetch(`${USERS_URL}/list/`);
    return await response.json();
}

// Eksport:
export { addUser, editUser, deleteUser, listUsers };
