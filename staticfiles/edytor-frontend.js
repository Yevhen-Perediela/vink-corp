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
    'py': 'file_type_python.svg',
    'js': 'file_type_js.svg',
    'ts': 'file_type_typescript.svg',
    'html': 'file_type_html.svg',
    'css': 'file_type_css.svg',
    'json': 'file_type_json.svg',
    'php': 'file_type_php.svg',
    'md': 'file_type_markdown.svg',
    'sh': 'file_type_shell.svg',
    'c': 'file_type_c.svg',
    'cpp': 'file_type_cpp.svg',
    'java': 'file_type_java.svg',
    'cs': 'file_type_csharp.svg',
    'txt': 'file_type_text.svg',
    'default': 'default_file.svg',
};

function getIconURL(extension) {
    // Mapowanie rozszerzeń na klasy FontAwesome
    const extensionToIconClass = {
        'py': 'fab fa-python',     // Ikona Pythona
        'js': 'fab fa-js',         // Ikona JavaScriptu
        'ts': 'fab fa-js',         // Ikona TypeScriptu
        'html': 'fas fa-file-code', // Ikona HTML
        'css': 'fas fa-file-code', // Ikona CSS
        'json': 'fas fa-file-code', // Ikona JSON
        'php': 'fab fa-php',       // Ikona PHP
        'md': 'fas fa-file-alt',   // Ikona Markdown
        'sh': 'fas fa-terminal',   // Ikona Shell
        'c': 'fas fa-file-code',   // Ikona C
        'cpp': 'fab fa-cuttlefish', // Ikona C++
        'java': 'fab fa-java',     // Ikona Java
        'cs': 'fab fa-microsoft',  // Ikona C#
        'txt': 'fas fa-file-alt',  // Ikona Text
        'default': 'fas fa-file'   // Domyślna ikona pliku
    };

    // Zwróć odpowiednią klasę FontAwesome na podstawie rozszerzenia
    return extensionToIconClass[extension] || extensionToIconClass['default'];
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
    let url =  document.getElementById('repoUrl').value;
    if(url != ""){
        localStorage.setItem('cur-repoUrl', url);
    }else{
        url = localStorage.getItem('cur-repoUrl');
    }    


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
            const ext = name.split('.').pop().toLowerCase();  // Pobranie rozszerzenia pliku
            const iconClass = getIconURL(ext);  // Uzyskanie klasy FontAwesome dla ikony
            div.classList.add('tree-item', 'file');
            div.innerHTML = `<i class="${iconClass}"></i> ${name}`;  // Ikona FontAwesome
            div.onclick = () => loadFile(obj.path);
        } else {
            const iconClass = "fas fa-folder";  // Ikona folderu
            const summary = document.createElement('div');
            summary.classList.add('tree-item', 'folder');
            summary.innerHTML = `<i class="${iconClass}"></i> ${name}`;
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

    appendMessage("Ty", message);
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
    msg.innerHTML = `<b>${who}:</b><br>${text}<br><br>`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}
window.addEventListener("load", () => {
    appendMessage("Ty", "Co potrafisz?");
    appendMessage("AI", "Cześć! Jestem asystentem AI edytora Vink. Mogę refaktoryzować, komentować i tłumaczyć Twój kod.");
});
