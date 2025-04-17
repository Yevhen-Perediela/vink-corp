var git = document.getElementById("github");
var edytor = document.getElementById("editor");
var folders = document.getElementById("folders");

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
    const url = document.getElementById('repoUrl').value;
    localStorage.setItem('cur-repoUrl', url);
    fetch(`/edytor/api/github-tree/?url=${encodeURIComponent(url)}`)
        .then(res => res.json())
        .then(tree => {
            const files = tree.filter(entry => entry.type === 'blob');
            renderFileTree(files);
        });
}


function loadFile(path) {
    const [_, user, repo] = localStorage.getItem('cur-repoUrl').split('/').slice(-3);
    fetch(`/edytor/api/github-file/?user=${user}&repo=${repo}&file=${path}`)
        .then(res => res.json())
        .then(data => {
            if (data.content) {
                editor.setValue(data.content);
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
            div.textContent = name;
            div.classList.add('tree-item', 'file');
            div.onclick = () => loadFile(obj.path);
        } else {
            const summary = document.createElement('div');
            summary.textContent = name;
            summary.classList.add('tree-item', 'folder');
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
