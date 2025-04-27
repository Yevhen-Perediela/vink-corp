// require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
// require(['vs/editor/editor.main'], function () {
//     window.editor = monaco.editor.create(document.getElementById('editor'), {
//         value: `// Hello, Vink 👋\nconsole.log("Edit me!");`,
//         language: 'python',
//         theme: 'vs-dark',
//         automaticLayout: true,
//     });

//     // <<< Teraz tutaj! >>>
//     window.editor.onDidChangeModelContent(() => {
//         window.editorContentNow = window.editor.getValue();
//         renderTabs();
//     });

//     startEditor(); // <--- I start aplikacji dopiero tutaj!
// });