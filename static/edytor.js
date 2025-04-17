require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
  require(['vs/editor/editor.main'], function () {
    window.editor = monaco.editor.create(document.getElementById('editor'), {
      value: `// Hello, Vink 👋\nconsole.log("Edit me!");`,
      language: 'python',
      theme: 'vs-dark',
      automaticLayout: true,
    });
  });

  // 🚀 Funkcja do pobrania kodu z edytora do zmiennej
  function getCodeFromEditor() {
    return window.editor.getValue();
  }

  // 🔥 Funkcja do ustawiania nowego kodu do edytora
  function setCodeInEditor(code) {
    window.editor.setValue(code);
  }