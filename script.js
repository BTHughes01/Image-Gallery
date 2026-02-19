const images = [
  'quiz_imgs/Satellite1.PNG',
  'quiz_imgs/Satellite2.PNG',
  'quiz_imgs/Satellite3.PNG',
  'quiz_imgs/Satellite4.PNG',
  'quiz_imgs/Satellite5.PNG',
  'quiz_imgs/Satellite6.PNG',
  'quiz_imgs/Satellite7.PNG',
  'quiz_imgs/Satellite8.PNG',
  'quiz_imgs/Satellite9.PNG',
  'quiz_imgs/Satellite10.PNG',
  'quiz_imgs/Satellite11.PNG',
  'quiz_imgs/Satellite12.PNG',
  'quiz_imgs/Satellite13.PNG',
  'quiz_imgs/Satellite14.PNG',
  'quiz_imgs/Satellite15.PNG'
];

const slide = document.getElementById('slide');
const stage = document.getElementById('stage');
const counter = document.getElementById('counter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resetZoomBtn = document.getElementById('resetZoomBtn');

let index = 0;
let scale = 1;
let translateX = 0;
let translateY = 0;

const minScale = 1;
const maxScale = 4;
const pointers = new Map();

let swipeStartX = 0;
let swipeStartY = 0;
let swipePointerId = null;

let dragStartX = 0;
let dragStartY = 0;
let dragBaseX = 0;
let dragBaseY = 0;
let dragging = false;

let pinchStartDistance = 0;
let pinchStartScale = 1;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setImage(nextIndex) {
  const wrapped = (nextIndex + images.length) % images.length;
  index = wrapped;
  slide.src = images[index];
  slide.alt = `Satellite image ${index + 1}`;
  counter.textContent = `${index + 1} / ${images.length}`;
  resetZoom();
}

function applyTransform() {
  slide.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function resetZoom() {
  scale = 1;
  translateX = 0;
  translateY = 0;
  applyTransform();
}

function goNext() {
  setImage(index + 1);
}

function goPrev() {
  setImage(index - 1);
}

function getDistance(first, second) {
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  return Math.hypot(dx, dy);
}

prevBtn.addEventListener('click', goPrev);
nextBtn.addEventListener('click', goNext);
resetZoomBtn.addEventListener('click', resetZoom);

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    goPrev();
  }
  if (event.key === 'ArrowRight') {
    goNext();
  }
});

stage.addEventListener('pointerdown', (event) => {
  stage.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (pointers.size === 1) {
    swipePointerId = event.pointerId;
    swipeStartX = event.clientX;
    swipeStartY = event.clientY;

    if (scale > 1) {
      dragging = true;
      slide.classList.add('dragging');
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragBaseX = translateX;
      dragBaseY = translateY;
    }
  }

  if (pointers.size === 2) {
    const [first, second] = [...pointers.values()];
    pinchStartDistance = getDistance(first, second);
    pinchStartScale = scale;
    dragging = false;
    slide.classList.add('dragging');
  }
});

stage.addEventListener('pointermove', (event) => {
  if (!pointers.has(event.pointerId)) {
    return;
  }

  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (pointers.size === 2) {
    const [first, second] = [...pointers.values()];
    const currentDistance = getDistance(first, second);
    if (pinchStartDistance > 0) {
      scale = clamp((currentDistance / pinchStartDistance) * pinchStartScale, minScale, maxScale);
      if (scale === 1) {
        translateX = 0;
        translateY = 0;
      }
      applyTransform();
    }
    return;
  }

  if (dragging && scale > 1 && swipePointerId === event.pointerId) {
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;
    translateX = dragBaseX + dx;
    translateY = dragBaseY + dy;
    applyTransform();
  }
});

stage.addEventListener('pointerup', (event) => {
  const current = pointers.get(event.pointerId);

  if (swipePointerId === event.pointerId && current) {
    const dx = current.x - swipeStartX;
    const dy = current.y - swipeStartY;

    if (scale === 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  }

  pointers.delete(event.pointerId);
  if (pointers.size < 2) {
    pinchStartDistance = 0;
  }

  if (swipePointerId === event.pointerId) {
    swipePointerId = null;
  }

  if (pointers.size === 0) {
    dragging = false;
    slide.classList.remove('dragging');
  }
});

stage.addEventListener('pointercancel', (event) => {
  pointers.delete(event.pointerId);
  if (swipePointerId === event.pointerId) {
    swipePointerId = null;
  }
  if (pointers.size === 0) {
    dragging = false;
    slide.classList.remove('dragging');
  }
});

setImage(0);
