var git = document.getElementById("github");
var edytor = document.getElementById("editor");
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
    'txt': 'code/code-original.svg',
    'default': 'java/folder-original.svg',
};

function getIconURL(extension) {
    const filename = extensionToIconURL[extension] || extensionToIconURL['default'];
    return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${filename}`;
}



function setLanguageByFilename(filename) {
    const ext = filename.split('.').pop();
    const language = extensionToLanguage[ext] || 'plaintext';
    monaco.editor.setModelLanguage(editor.getModel(), language);
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

function showGit(el) {
    if (git.style.display === "block") {
        git.style.display = "none";
        edytor.style.width = "80%";
    } else {
        git.style.display = "block";
        edytor.style.width = "65%";
        folders.style.display = "none";
    }
}



function loadRepoTree() {
    const url = localStorage.getItem('cur-repoUrl') || document.getElementById('repoUrl').value;
    localStorage.setItem('cur-repoUrl', url);

    fetch(`/edytor/api/github-tree/?url=${encodeURIComponent(url)}`)
        .then(res => {
            if (!res.ok) throw new Error("Nie udało się pobrać repozytorium.");
            return res.json();
        })
        .then(tree => {
            if (!Array.isArray(tree)) {
                console.error("Nieprawidłowa odpowiedź API:", tree);
                alert(tree.error || "Wystąpił błąd przy ładowaniu repo.");
                return;
            }
            // NIE twórz już zmiennej files!
            renderFileTree(tree);  // <-- tutaj przekazujemy całe drzewo (foldery + pliki)
        })
        .catch(err => {
            alert("Błąd podczas ładowania repo: " + err.message);
        });
}

loadRepoTree()


function loadFile(path) {
    const [_, user, repo] = localStorage.getItem('cur-repoUrl').split('/').slice(-3);
    fetch(`/edytor/api/github-file/?user=${user}&repo=${repo}&file=${path}`)
        .then(res => res.json())
        .then(data => {
            if (data.content) {
                editor.setValue(data.content);
                setLanguageByFilename(data.filename);
            }
        });
}


function renderFileTree(tree) {
    const container = document.getElementById('folders');
    container.innerHTML = '';

    const root = {};
    tree.forEach(entry => {
        const parts = entry.path.split('/');
        let current = root;

        parts.forEach((part, i) => {
            if (!current[part]) {
                current[part] = i === parts.length - 1 && entry.type === 'blob'
                    ? { __file: true, path: entry.path }
                    : {};
            }
            current = current[part];
        });
    });

    function createTreeNode(obj, name = '') {
        const div = document.createElement('div');
        const isFile = obj.__file;
    
        if (isFile) {
            const ext = name.split('.').pop().toLowerCase();
            const iconURL = getIconURL(ext);
            div.classList.add('tree-item', 'file');
            div.innerHTML = `<img src="${iconURL}" class="icon"> ${name}`;
            div.onclick = () => loadFile(obj.path);
        } else {
            const iconURL = "https://github.com/vscode-icons/vscode-icons/default_folder.svg";
            const summary = document.createElement('div');
            summary.classList.add('tree-item', 'folder');
            summary.innerHTML = ` ${name}`;
            summary.onclick = () => nested.classList.toggle('active');
    
            const nested = document.createElement('div');
            nested.classList.add('nested');
    
            Object.keys(obj).forEach(childName => {
                if (childName !== '__file') {
                    nested.appendChild(createTreeNode(obj[childName], childName));
                }
            });
    
            div.appendChild(summary);
            div.appendChild(nested);
        }
    
        return div;
    }
    

    Object.keys(root).forEach(name => {
        container.appendChild(createTreeNode(root[name], name));
    });
}
const chatBox = document.getElementById('chat-messages');
const chatInput = document.getElementById('user-input');

function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    appendMessage("You", message);
    chatInput.value = "";

    fetch("/edytor/api/ai/chat/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: message })
    })
    .then(res => res.json())
    .then(data => {
        if (data.response) {
            appendMessage("AI", data.response);
        } else {
            appendMessage("AI", "Brak odpowiedzi.");
        }
    })
    .catch(() => {
        appendMessage("AI", "Wystąpił błąd sieci.");
    });
}

function appendMessage(who, text) {
    const msg = document.createElement("div");
    msg.classList.add('chat-message');
    if (who === "You") {
        msg.classList.add('user-message');
    } else {
        msg.classList.add('ai-message');
    }
    msg.innerHTML = `${text}`;    
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}
window.addEventListener("load", () => {
    appendMessage("You", "Co potrafisz?");
    appendMessage("AI", "Cześć! Jestem asystentem AI edytora Vink. Mogę refaktoryzować, komentować i tłumaczyć Twój kod.");
});
