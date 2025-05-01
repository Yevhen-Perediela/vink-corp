window.initWhiteboard = function () {
  console.log("HELLO");
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  let drawing = false;

  canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    draw(e);
  });

  canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
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

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e90ff';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
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