const GROUP_REQUESTS_URL = 'http://127.0.0.1:8000/todo/groupRequest';

async function addGroupRequest(requestData) {
    const response = await fetch(`${GROUP_REQUESTS_URL}/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    });
    return await response.json();
}

async function deleteGroupRequest(requestId) {
    const response = await fetch(`${GROUP_REQUESTS_URL}/delete/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId })
    });
    return await response.json();
}

async function listGroupRequests() {
    const response = await fetch(`${GROUP_REQUESTS_URL}/list/`);
    return await response.json();
}

// Eksport:
export { addGroupRequest, deleteGroupRequest, listGroupRequests };
