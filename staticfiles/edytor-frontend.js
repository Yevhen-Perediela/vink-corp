var git = document.getElementById("github");
var edytor = document.getElementById("editor-wrap");
var folders = document.getElementById("folders");

const extensionToLanguage = {
    'py': 'python',
    'js': 'javascript',
    'ts': 'typescript',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'php': 'php',
    'md': 'markdown',
    'sh': 'shell',
    'c': 'c',
    'cpp': 'cpp',
    'java': 'java',
    'cs': 'csharp',
    'txt': 'plaintext',
};

const extensionToIconURL = {
    'py': 'python/python-original.svg',
    'js': 'javascript/javascript-original.svg',
    'ts': 'typescript/typescript-original.svg',
    'html': 'html5/html5-original.svg',
    'css': 'css3/css3-original.svg',
    'json': 'code/code-original.svg',
    'php': 'php/php-original.svg',
    'md': 'markdown/markdown-original.svg',
    'sh': 'bash/bash-original.svg',
    'c': 'c/c-original.svg',
    'cpp': 'cplusplus/cplusplus-original.svg',
    'java': 'java/java-original.svg',
    'cs': 'csharp/csharp-original.svg',
};

function getIconURL(ext) {
    return extensionToIconURL[ext] ?
        `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${extensionToIconURL[ext]}` :
        'https://img.icons8.com/?size=100&id=1395&format=png&color=FFFFFF';
}

function setLanguageByFilename(filename) {
    const ext = filename.split('.').pop();
    monaco.editor.setModelLanguage(editor.getModel(), extensionToLanguage[ext] || 'plaintext');
}

window.openFiles = JSON.parse(localStorage.getItem('open-files') || '[]');
window.fileContents = {};
window.editorContentNow = "";

function saveOpenFiles() {
    localStorage.setItem('open-files', JSON.stringify(window.openFiles));
}

function openFileInTab(path) {
    if (!window.openFiles.includes(path)) {
        window.openFiles.push(path);
        saveOpenFiles();
    }
    renderTabs();
}

function renderTabs() {
    const tabsContainer = document.getElementById('tabs');
    tabsContainer.innerHTML = '';
    window.openFiles.forEach(path => {
        const tab = document.createElement('div');
        tab.className = 'tab-item';
        if (path === window.currentEditingPath) tab.classList.add('active');
        const filename = path.split('/').pop();

        let dirty = false;
        if (path === window.currentEditingPath) {
            const saved = window.fileContents[path] || "";
            dirty = window.editorContentNow !== saved;
        }

        tab.innerHTML = `${filename} <span class="tab-icon">${dirty ? '●' : '×'}</span>`;
        tab.onclick = () => {
            if (path !== window.currentEditingPath) {
                if (window.currentEditingPath) saveCurrentFile(false);
                loadFile(path);
            }
        };
        tab.querySelector('.tab-icon').onclick = (e) => {
            e.stopPropagation();
            closeTab(path);
        };
        tabsContainer.appendChild(tab);
    });
}

function closeTab(path) {
    window.openFiles = window.openFiles.filter(p => p !== path);
    saveOpenFiles();
    if (path === window.currentEditingPath) {
        editor.setValue('wybierz plik :)');
        window.currentEditingPath = null;
        window.editorContentNow = "";
    }
    renderTabs();
}

function saveCurrentFile(alertIfNone = true) {
    const repo = localStorage.getItem('cur-repoName');
    const path = window.currentEditingPath;
    if (!path) {
        if (alertIfNone) alert("Nie wybrano pliku do zapisu!");
        return;
    }
    fetch('/edytor/api/save-file/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repo, file: path, content: editor.getValue() })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log("✅ Zapisano plik");
                window.fileContents[path] = editor.getValue();
                window.editorContentNow = editor.getValue();
                renderTabs();
            }
        })
        .catch(err => {
            console.error("❌ Błąd zapisu:", err);
        });
}

document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentFile();
    }
});

// window.editor.onDidChangeModelContent(() => {
//     window.editorContentNow = editor.getValue();
//     renderTabs();
// }); 

function loadRepoTree() {
    const url = localStorage.getItem('cur-repoUrl') || document.getElementById('repoUrl').value;
    if (!url) return;
    const repo = url.split('/').pop();
    localStorage.setItem('cur-repoName', repo);

    fetch(`/edytor/api/local-tree/?repo=${encodeURIComponent(repo)}`)
        .then(res => res.json())
        .then(tree => {
            if (!Array.isArray(tree)) {
                console.error('Błąd drzewa:', tree.error || 'Nieznany błąd');
                alert(tree.error || 'Nie udało się załadować repozytorium.');
                return;
            }
            renderFileTree(tree, repo);
        })
        .catch(err => {
            console.error("Błąd ładowania drzewa:", err);
            alert('Błąd sieci podczas ładowania repozytorium.');
        });
}

function renderFileTree(tree, repoName) {
    const container = document.getElementById('folders');
    container.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = repoName;
    title.classList.add('repo-title');

    const rootActions = document.createElement('span');
    rootActions.className = 'folder-actions';
    rootActions.style.display = 'none';
    rootActions.innerHTML = `
        <button class="create-file">📄</button>
        <button class="create-folder">📁</button>
    `;
    title.appendChild(rootActions);

    container.appendChild(title);

    container.addEventListener('click', (e) => {
        if (!e.target.closest('.tree-item')) {
            document.querySelectorAll('.folder-actions').forEach(el => el.style.display = 'none');
            rootActions.style.display = 'inline-block';
        }
    });

    rootActions.querySelector('.create-file').onclick = (e) => {
        e.stopPropagation();
        createInputForNew('file', '', container);
    };
    rootActions.querySelector('.create-folder').onclick = (e) => {
        e.stopPropagation();
        createInputForNew('folder', '', container);
    };

    const root = {};
    tree.forEach(entry => {
        const parts = entry.path.split('/');
        let current = root;
        parts.forEach((part, i) => {
            if (!current[part]) {
                current[part] = (i === parts.length - 1 && entry.type === 'blob') ? { __file: true, path: entry.path } : {};
            }
            current = current[part];
        });
    });

    function createTreeNode(obj, name = '', parentPath = '') {
        const div = document.createElement('div');
        const fullPath = parentPath ? `${parentPath}/${name}` : name;
        if (obj.__file) {
            const ext = name.split('.').pop().toLowerCase();
            div.classList.add('tree-item', 'file');
            div.innerHTML = `<img src="${getIconURL(ext)}" alt="${ext}" class="tree_item_img"> ${name}`;
            div.onclick = () => loadFile(obj.path);
        } else {
            const summary = document.createElement('div');
            summary.classList.add('tree-item', 'folder');
            summary.innerHTML = `
                <img src="https://cdn.creazilla.com/icons/3234388/folder-icon-md.png" class="tree_item_img">
                ${name}
                <span class="folder-actions" style="display:none;">
                    <button class="create-file">📄</button>
                    <button class="create-folder">📁</button>
                </span>
            `;
            const nested = document.createElement('div');
            nested.classList.add('nested');

            summary.onclick = (e) => {
                e.stopPropagation();
                document.querySelectorAll('.folder-actions').forEach(el => el.style.display = 'none');
                summary.querySelector('.folder-actions').style.display = 'inline-block';
                nested.classList.toggle('active');
            };

            summary.querySelector('.create-file').onclick = (e) => {
                e.stopPropagation();
                createInputForNew('file', fullPath, nested);
            };
            summary.querySelector('.create-folder').onclick = (e) => {
                e.stopPropagation();
                createInputForNew('folder', fullPath, nested);
            };

            Object.keys(obj).filter(k => k !== '__file').sort().forEach(child => {
                nested.appendChild(createTreeNode(obj[child], child, fullPath));
            });

            div.appendChild(summary);
            div.appendChild(nested);
        }
        return div;
    }

    Object.keys(root).forEach(name => {
        container.appendChild(createTreeNode(root[name], name));
    });

    renderTabs();
}

function createInputForNew(type, folderPath, container) {
    const inputDiv = document.createElement('div');
    inputDiv.classList.add('tree-item', 'new-item');
    const input = document.createElement('input');
    input.placeholder = type === 'file' ? 'Nowy plik...' : 'Nowy folder...';
    inputDiv.appendChild(input);
    container.prepend(inputDiv);
    input.focus();

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const name = input.value.trim();
            if (name) {
                createItem(folderPath ? folderPath + '/' + name : name, type);
            }
            inputDiv.remove();
        } else if (e.key === 'Escape') {
            inputDiv.remove();
        }
    });
}

function createItem(path, type) {
    const repo = localStorage.getItem('cur-repoName');
    fetch(`/edytor/api/create-${type}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repo, path })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log(`✅ Utworzono ${type}:`, path);
                loadRepoTree();
            } else {
                alert(data.error || "Błąd tworzenia");
            }
        })
        .catch(err => {
            console.error("❌ Błąd tworzenia:", err);
        });
}

function loadFile(path) {
    const repo = localStorage.getItem('cur-repoName');
    fetch(`/edytor/api/local-file/?repo=${repo}&file=${encodeURIComponent(path)}`)
        .then(res => res.json())
        .then(data => {
            if (data.content !== undefined) {
                editor.setValue(data.content || '');
                setLanguageByFilename(data.filename || path);
                window.currentEditingPath = path;
                window.fileContents[path] = data.content || '';
                window.editorContentNow = data.content || '';
                openFileInTab(path);
                renderTabs();
            } else {
                alert(data.error || "Nie można otworzyć pliku.");
            }
        });
}

function startEditor() {
    const repo = localStorage.getItem('cur-repoName');
    if (repo) {
        console.log("🔄 Ładuję lokalne repo:", repo);
        loadRepoTree();
        loadCommitHistory();
    } else {
        console.log("⚠️ Brak repo w localStorage. Wpisz URL i sklonuj repo.");
    }
    renderTabs();
}

startEditor();


// right menu
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('header button');
    const panels = {
        'chatgpt': document.getElementById('chatgpt'),
        'small-todo': document.getElementById('small-todo'),
        'chat': document.getElementById('chat')
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const panelToShow = button.getAttribute('data-panel');
            for (const key in panels) {
                if (panels[key]) {
                    panels[key].style.display = (key === panelToShow) ? 'flex' : 'none';
                }
            }
        });
    });
});


function showGit(el) {
    if (git.style.display === "flex") {
        git.style.display = "none";
        edytor.style.width = "80%";
    } else {
        git.style.display = "flex";
        edytor.style.width = "65%";
        folders.style.display = "none";
    }
}

function showFolders(el) {
    if (folders.style.display === "block") {
        folders.style.display = "none";
        edytor.style.width = "80%";
    } else {
        folders.style.display = "block";
        edytor.style.width = "65%";
        git.style.display = "none";
    }
}

async function loadCommitHistory() {
    const repoName = localStorage.getItem('cur-repoName');
    if (!repoName) return;

    try {
        const response = await fetch(`/edytor/api/commit-history/?repo=${repoName}`, {
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });

        const data = await response.json();

        if (data.error) {
            console.error(data.error);
            return;
        }

        const commitsList = document.getElementById('commits-list');
        commitsList.innerHTML = '';

        data.commits.forEach(commit => {
            const commitElement = document.createElement('div');
            commitElement.className = 'commit-item';

            commitElement.innerHTML = `
                <div class="commit-message">
                    <div class="commit-dot"></div>
                    <div class="commit-title">${commit.message}</div>
                </div>
                <div class="commit-meta">
                    <div class="commit-author">
                        <i class="fas fa-user" style="margin-right: 4px;"></i>
                        ${commit.author}
                    </div>
                    <div class="commit-date">
                        <i class="fas fa-clock" style="margin-right: 4px;"></i>
                        ${commit.date}
                    </div>
                </div>
                <div class="commit-hash">
                    ${commit.hash.substring(0, 7)}
                </div>
            `;

            commitsList.appendChild(commitElement);
        });
    } catch (error) {
        console.error('Błąd podczas pobierania historii:', error);
    }
}

async function cloneRepository() {
    const urlInput = document.getElementById('repoUrl');
    const repoUrl = urlInput.value.trim();

    if (!repoUrl) {
        alert('Podaj link do repozytorium!');
        return;
    }

    try {
        const response = await fetch('/edytor/api/clone-repo/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                url: repoUrl,
                
            })
        });

        const data = await response.json();
        const repoName = repoUrl.split('/').pop().replace('.git', '');

        if (response.ok) {
            if (data.message && (data.message.includes('Repozytorium już istnieje lokalnie') || data.message.includes('Sklonowano'))) {
                localStorage.setItem('cur-repoName', repoName);
                localStorage.setItem('cur-repoUrl', repoUrl);
                window.openFiles = [];
                window.fileContents = {};
                window.currentEditingPath = null;
                editor.setValue('wybierz plik :)');
                loadRepoTree();
                loadCommitHistory();
                alert(data.message);
            } else {
                alert(data.message || 'Operacja zakończona.');
            }
        } else {
            if (data.error && data.error.includes('authentication') || data.error.includes('autoryzacji')) {
                alert('Błąd autoryzacji! Podaj GitHub Token.');
                changeGitToken();
            } else {
                alert(data.error || 'Wystąpił błąd podczas klonowania.');
            }
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Coś poszło mocno nie tak podczas klonowania...');
    }
}



// Funkcja do pobierania tokena CSRF z ciasteczka
function getCSRFToken() {
    const name = 'csrftoken=';
    const decodedCookies = decodeURIComponent(document.cookie);
    const cookies = decodedCookies.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name)) {
            return cookie.substring(name.length);
        }
    }
    return '';
}


async function pullChanges() {
    const repoName = localStorage.getItem('cur-repoName');
    if (!repoName) {
        alert('Najpierw wybierz repozytorium!');
        return;
    }

    try {
        const response = await fetch('api/pull-repo/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({ repo: repoName })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || 'Repozytorium zostało zaktualizowane!');
            loadRepoTree();
            loadCommitHistory();
        } else {
            alert(data.error || 'Wystąpił błąd podczas aktualizacji.');
        }
    } catch (error) {
        console.error('Błąd pullowania:', error);
        alert('Coś poszło mocno nie tak podczas pulla...');
    }
}

async function commitChanges() {
    const repoName = localStorage.getItem('cur-repoName');
    if (!repoName) {
        alert('Najpierw wybierz repozytorium!');
        return;
    }

    const commitMessage = document.getElementById('commitMessage').value.trim();
    if (commitMessage === null) {
        return; // Kliknięto "Anuluj"
    }

    try {
        const response = await fetch('api/push-repo/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({ repo: repoName, message: commitMessage })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || 'Zmiany wypchnięte!');
            loadCommitHistory();
        } else {
            alert(data.error || 'Wystąpił błąd podczas pushowania.');
        }
    } catch (error) {
        console.error('Błąd pushowania:', error);
        alert('Coś poszło mocno nie tak podczas pushowania...');
    }
}

let lastAISuggestion = "";
let originalBeforeAISuggestion = "";

function sendChatMessage() {
    const chatInput = document.getElementById('user-input');
    const message = chatInput.value.trim();

    if (!message) return;

    appendMessage("Ty", message);
    chatInput.value = "";

    // const currentCode = getCodeFromEditor();
    // const currentCode = editor.getValue();

    const selection = editor.getSelection();
    const selectedText = editor.getModel().getValueInRange(selection);
    const currentCode = selectedText.trim() !== "" ? selectedText : editor.getValue();

    originalBeforeAISuggestion = editor.getValue();

    fetch("/edytor/ai/apiconnect/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: message,
                code: currentCode
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.response) {
                // appendMessage("AI", data.response);
                // lastAISuggestion = data.response;
                // addAcceptRejectButtons();
                const extracted = extractCodeFromResponse(data.response);
                lastAISuggestion = extracted || data.response;
                appendMessage("AI", data.response); // pokaż pełną wiadomość użytkownikowi
                addAcceptRejectButtons();

            } else {
                appendMessage("AI", "Brak odpowiedzi.");
            }
        })
        .catch(() => {
            appendMessage("AI", "Błąd połączenia z serwerem.");
        });
}

function addAcceptRejectButtons() {
    const chatInputDiv = document.getElementById('chat-input');

    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = "Accept";
    acceptBtn.onclick = () => {
        editor.setValue(lastAISuggestion);
        removeAcceptRejectButtons();
    };
    acceptBtn.id = "accept-btn";
    acceptBtn.style.marginLeft = "10px";

    const rejectBtn = document.createElement('button');
    rejectBtn.textContent = "Reject";
    rejectBtn.onclick = () => {
        editor.setValue(originalBeforeAISuggestion);
        removeAcceptRejectButtons();
    };
    rejectBtn.id = "reject-btn";
    rejectBtn.style.marginLeft = "5px";

    chatInputDiv.appendChild(acceptBtn);
    chatInputDiv.appendChild(rejectBtn);
}

function removeAcceptRejectButtons() {
    const acceptBtn = document.getElementById('accept-btn');
    const rejectBtn = document.getElementById('reject-btn');
    if (acceptBtn) acceptBtn.remove();
    if (rejectBtn) rejectBtn.remove();
}

function extractCodeFromResponse(text) {
    const codeBlock = text.match(/```(?:\w*\n)?([\s\S]*?)```/);
    if (codeBlock && codeBlock[1]) {
        return codeBlock[1].trim(); // tylko czysty kod z ```...```
    }
    return null; // jeśli nie znaleziono bloku kodu
}

function appendMessage(who, text) {
    const chatBox = document.getElementById('chat-messages');
    const msg = document.createElement("div");
    msg.classList.add('chat-message');

    if (who === "Ty") {
        msg.classList.add('user-message');
    } else {
        msg.classList.add('ai-message');
    }

    msg.innerHTML = `${text}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}


window.addEventListener("load", () => {
    appendMessage("Ty", "Hej!");
    appendMessage("AI", "Cześć! Jestem asystentem AI edytora Vink. Mogę refaktoryzować, komentować i tłumaczyć Twój kod.");
});