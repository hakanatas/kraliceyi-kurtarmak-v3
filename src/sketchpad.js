// Sihirli Kalem Çizim Alanı: öğrenci cevaptan önce modelini (kutu, şekil, ok...)
// kendisi çizer. Kitaptaki "çizdiğin şey gerçek olur" fikrinin oyundaki karşılığı.
import { ui } from './i18n.js';

export function createSketchpad(container, lang, onFirstStroke) {
  const t = ui[lang];
  container.innerHTML = `
    <div class="sketch-area">
      <p class="sketch-note">${t["sketch-hint"]}</p>
      <div class="sketch-toolbar">
        <button class="btn btn--secondary btn--small sketch-tool sketch-tool--active" id="sketchPen">${t["sketch-pen"]}</button>
        <button class="btn btn--secondary btn--small sketch-tool" id="sketchEraser">${t["sketch-eraser"]}</button>
        <button class="btn btn--secondary btn--small" id="sketchClear">${t["sketch-clear"]}</button>
        <div class="sketch-colors">
          <button class="sketch-color sketch-color--active" data-color="#7c3aed" style="background:#7c3aed;" aria-label="Mor"></button>
          <button class="sketch-color" data-color="#059669" style="background:#059669;" aria-label="Yeşil"></button>
          <button class="sketch-color" data-color="#c2410c" style="background:#c2410c;" aria-label="Turuncu"></button>
          <button class="sketch-color" data-color="#0f172a" style="background:#0f172a;" aria-label="Siyah"></button>
        </div>
      </div>
      <canvas class="sketch-canvas" id="sketchCanvas"></canvas>
    </div>
  `;

  const canvas = container.querySelector('#sketchCanvas');
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let erasing = false;
  let strokeColor = '#7c3aed';
  let firedFirstStroke = false;
  let lastX = 0, lastY = 0;

  function resize() {
    const w = canvas.parentElement ? canvas.parentElement.clientWidth - 4 : 600;
    if (w <= 0) return; // henüz görünür değil
    // Mevcut çizimi koru
    const prev = document.createElement('canvas');
    prev.width = canvas.width || 1;
    prev.height = canvas.height || 1;
    prev.getContext('2d').drawImage(canvas, 0, 0);
    canvas.width = w;
    canvas.height = 220;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (prev.width > 1) ctx.drawImage(prev, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    drawing = true;
    const p = pos(e);
    lastX = p.x; lastY = p.y;
    if (!firedFirstStroke) {
      firedFirstStroke = true;
      onFirstStroke && onFirstStroke();
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.strokeStyle = erasing ? 'rgba(255,255,255,1)' : strokeColor;
    ctx.lineWidth = erasing ? 22 : 3;
    ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    lastX = p.x; lastY = p.y;
  });
  const stop = () => { drawing = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  const penBtn = container.querySelector('#sketchPen');
  const eraserBtn = container.querySelector('#sketchEraser');
  penBtn.addEventListener('click', () => {
    erasing = false;
    penBtn.classList.add('sketch-tool--active');
    eraserBtn.classList.remove('sketch-tool--active');
  });
  eraserBtn.addEventListener('click', () => {
    erasing = true;
    eraserBtn.classList.add('sketch-tool--active');
    penBtn.classList.remove('sketch-tool--active');
  });
  container.querySelector('#sketchClear').addEventListener('click', () => {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });
  container.querySelectorAll('.sketch-color').forEach(btn => {
    btn.addEventListener('click', () => {
      strokeColor = btn.getAttribute('data-color');
      erasing = false;
      penBtn.classList.add('sketch-tool--active');
      eraserBtn.classList.remove('sketch-tool--active');
      container.querySelectorAll('.sketch-color').forEach(b => b.classList.remove('sketch-color--active'));
      btn.classList.add('sketch-color--active');
    });
  });

  return { resize };
}
