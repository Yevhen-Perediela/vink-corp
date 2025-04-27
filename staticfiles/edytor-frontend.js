var git = document.getElementById("github");
var edytor = document.getElementById("editor-wrap");
var folders = document.getElementById("folders");

const extensionToLanguage = {
    'py': 'python', 'js': 'javascript', 'ts': 'typescript',
    'html': 'html', 'css': 'css', 'json': 'json', 'php': 'php',
    'md': 'markdown', 'sh': 'shell', 'c': 'c', 'cpp': 'cpp',
    'java': 'java', 'cs': 'csharp', 'txt': 'plaintext',
};

const extensionToIconURL = {
    'py': 'python/python-original.svg', 'js': 'javascript/javascript-original.svg',
    'ts': 'typescript/typescript-original.svg', 'html': 'html5/html5-original.svg',
    'css': 'css3/css3-original.svg', 'json': 'code/code-original.svg',
    'php': 'php/php-original.svg', 'md': 'markdown/markdown-original.svg',
    'sh': 'bash/bash-original.svg', 'c': 'c/c-original.svg',
    'cpp': 'cplusplus/cplusplus-original.svg', 'java': 'java/java-original.svg',
    'cs': 'csharp/csharp-original.svg',
};

function getIconURL(ext) {
    return extensionToIconURL[ext]
        ? `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${extensionToIconURL[ext]}`
        : 'https://img.icons8.com/?size=100&id=1395&format=png&color=FFFFFF';
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

window.editor.onDidChangeModelContent(() => {
    window.editorContentNow = editor.getValue();
    renderTabs();
});

function loadRepoTree() {
    const url = localStorage.getItem('cur-repoUrl') || document.getElementById('repoUrl').value;
    if (!url) return;
    const repo = url.split('/').pop();
    localStorage.setItem('cur-repoName', repo);

    fetch(`/edytor/api/local-tree/?repo=${encodeURIComponent(repo)}`)
        .then(res => res.json())
        .then(renderFileTree)
        .catch(err => {
            console.error("Błąd ładowania drzewa:", err);
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
                createItem(folderPath + '/' + name, type);
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
    } else {
        console.log("⚠️ Brak repo w localStorage. Wpisz URL i sklonuj repo.");
    }
    renderTabs();
}

startEditor();
