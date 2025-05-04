window.initWhiteboard = function () {
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  let arrowMode = false;
  let startX = 0;
  let startY = 0;
  let drawing = false;
  let currentColor = '#ff8000';
  let brushSize = 2;
  let isErasing = false;

  const colorPicker = document.getElementById('colorPicker');
  const brushSlider = document.getElementById('brushSize');

  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      currentColor = e.target.value;
    });
  }

  if (brushSlider) {
    brushSlider.addEventListener('input', (e) => {
      brushSize = parseInt(e.target.value);
    });
  }

  function setActiveTool(buttonElement) {
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.remove('active-tool');
    });
    buttonElement.classList.add('active-tool');
  }

  window.activateArrow = function (e) {
    arrowMode = true;
    isErasing = false;
    setActiveTool(e.currentTarget);
  };

  window.activateEraser = function (e) {
    isErasing = true;
    arrowMode = false;
    setActiveTool(e.currentTarget);
  };

  window.activateBrush = function (e) {
    isErasing = false;
    arrowMode = false;
    setActiveTool(e.currentTarget);
  };

  canvas.addEventListener('mousedown', (e) => {
    if (arrowMode) {
      const rect = canvas.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
    } else {
      drawing = true;
      draw(e);
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    if (arrowMode) {
      const rect = canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
      drawArrow(startX, startY, endX, endY);
    } else {
      drawing = false;
      ctx.beginPath();
    }
  });

  canvas.addEventListener('mouseout', () => {
    drawing = false;
    ctx.beginPath();
  });

  canvas.addEventListener('mousemove', draw);

  function draw(e) {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isErasing ? '#ffffff' : currentColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function drawArrow(fromX, fromY, toX, toY) {
    const headLength = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6),
                toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6),
                toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6),
                toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.stroke();
    ctx.fillStyle = currentColor;
    ctx.fill();
  }

  window.clearCanvas = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  window.saveCanvas = function () {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };
};