import * as T from 'three';
import { createLivingWatercolor3D, createWatercolorStyle }
  from '../../reference/ink-fallen-guardian/shared/living-watercolor-3d.js';
import { createInkCarrionStalker }
  from '../../reference/ink-carrion-stalker/ink-carrion-stalker.js';
import { inspectObject3D } from './three-master.js';

const dom = {
  menu: document.querySelector('#panel'),
  menuBtn: document.querySelector('#menuBtn'),
  metrics: document.querySelector('#metrics'),
  findings: document.querySelector('#findings'),
  badge: document.querySelector('#badge'),
  error: document.querySelector('#error')
};
const scene = new T.Scene();
scene.background = new T.Color('#252b30');
scene.fog = new T.FogExp2('#303237', .025);
const camera = new T.PerspectiveCamera(38, innerWidth / Math.max(1, innerHeight), .1, 200);
const renderer = new T.WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = T.SRGBColorSpace;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
document.body.prepend(renderer.domElement);
scene.add(new T.HemisphereLight('#c0dce1', '#2b292d', 2.4));
const key = new T.DirectionalLight('#f1e5d8', 3.3);
key.position.set(-5, 9, 8);
scene.add(key);
const fill = new T.DirectionalLight('#a1c6bf', 2.0);
fill.position.set(5, 7, -7);
scene.add(fill);
const ground = new T.Mesh(
  new T.CircleGeometry(8, 72),
  new T.MeshStandardMaterial({ color: '#343b3e', roughness: 1, transparent: true, opacity: .88 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -.215;
scene.add(ground);
const halo = new T.Mesh(
  new T.RingGeometry(4.9, 5.0, 96),
  new T.MeshBasicMaterial({ color: '#728b81', transparent: true, opacity: .25, side: T.DoubleSide })
);
halo.rotation.x = -Math.PI / 2;
halo.position.y = -.205;
scene.add(halo);
const canvas = document.createElement('canvas');
canvas.width = canvas.height = 256;
const context = canvas.getContext('2d');
const gradient = context.createRadialGradient(128, 128, 6, 128, 128, 128);
gradient.addColorStop(0, '#06080ad9');
gradient.addColorStop(.45, '#07090a44');
gradient.addColorStop(1, '#03040500');
context.fillStyle = gradient;
context.fillRect(0, 0, 256, 256);
const contact = new T.Mesh(new T.PlaneGeometry(6.8, 6.3),
  new T.MeshBasicMaterial({ map: new T.CanvasTexture(canvas), transparent: true, depthWrite: false }));
contact.rotation.x = -Math.PI / 2;
contact.position.y = -.208;
scene.add(contact);

const model = createInkCarrionStalker(113);
scene.add(model);
const result = inspectObject3D(model, { role: 'character' });
const originals = new Map();
model.traverse(o => {
  if (o.isMesh) originals.set(o, o.material);
});
const painter = createLivingWatercolor3D({
  THREE: T, renderer, scene, camera,
  style: createWatercolorStyle({
    seed: '3d-master-inspection-studio',
    inkColor: '#26282a', paperColor: '#b2aba4', washColor: '#72797a',
    washOpacity: .55, washLayers: 5, edgeWidth: .015, edgeJitter: .16,
    granulation: .28, bleed: .12, paintedLight: .60, motion: .065
  })
});
painter.apply(model, { seed: 'carrion-stalker-author-approved-ink' });
const diagnostic = {
  wire: new T.MeshBasicMaterial({ color: '#9fdfc5', wireframe: true, transparent: true, opacity: .9 }),
  normals: new T.MeshNormalMaterial({ side: T.DoubleSide }),
  clay: new T.MeshStandardMaterial({ color: '#b4a69a', roughness: .82, metalness: 0 })
};
let mode = 'ink';
let orbit = true;
let yaw = .43;
let pitch = .16;
let followYaw = yaw;
let followPitch = pitch;
let distance = 12.7;
const target = new T.Vector3(0, 2.4, .10);
const pointers = new Map();
let lastPinch = 0;
let lastMs = 0;
let elapsed = 0;
let frameMS = 16.7;
let quality = 1;

function renderMetrics() {
  const stats = result.metrics;
  const values = [
    ['Меши', stats.meshes],
    ['Треугольники', stats.triangles.toLocaleString('ru-RU')],
    ['Draw calls', stats.drawCalls],
    ['Материалы', stats.materials],
    ['Текстуры', stats.textures],
    ['Открытых рёбер', stats.openEdges],
    ['Нулевых граней', stats.degenerateTriangles],
    ['Неверных нормалей', stats.invertedNormals]
  ];
  dom.metrics.replaceChildren(...values.map(([label, val]) => {
    const block = document.createElement('div');
    block.className = 'metric';
    const strong = document.createElement('b');
    const caption = document.createElement('span');
    strong.textContent = String(val);
    caption.textContent = label;
    block.append(strong, caption);
    return block;
  }));
  const title = result.passed ? 'Сетка · технический PASS' : 'Сетка · найден HARD-дефект';
  dom.badge.textContent = title + ' / ' + result.hard + ' HARD / ' + result.soft + ' SOFT';
  dom.badge.classList.toggle('error', !result.passed);
  if (!result.findings.length) {
    const ok = document.createElement('p');
    ok.textContent = 'Автоматических дефектов не найдено. Художественная приёмка отдельно.';
    dom.findings.replaceChildren(ok);
  } else {
    dom.findings.replaceChildren(...result.findings.map(item => {
      const card = document.createElement('div');
      card.className = 'finding ' + item.severity;
      const title = document.createElement('strong');
      const desc = document.createElement('small');
      title.textContent = item.id + ' / ' + item.severity + ' / ' + item.where;
      desc.textContent = item.problem + '. Исправление: ' + item.fix;
      card.append(title, desc);
      return card;
    }));
  }
}
renderMetrics();
function setMode(next) {
  mode = next;
  model.traverse(o => {
    if (!o.isMesh) return;
    if (o.name === '__livingWatercolorOutline') {
      o.visible = next === 'ink';
      return;
    }
    if (!originals.has(o)) return;
    o.material = next === 'ink' ? originals.get(o) : diagnostic[next];
  });
  document.querySelectorAll('[data-mode]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.mode === next));
  });
}
function view(next) {
  if (next === 'orbit') {
    orbit = true;
  } else {
    orbit = false;
    yaw = { front: 0, side: Math.PI / 2, back: Math.PI }[next] ?? yaw;
    pitch = .11;
  }
  dom.menu.hidden = true;
  dom.menuBtn.setAttribute('aria-expanded', 'false');
}
dom.menuBtn.addEventListener('click', () => {
  dom.menu.hidden = !dom.menu.hidden;
  dom.menuBtn.setAttribute('aria-expanded', String(!dom.menu.hidden));
});
document.querySelectorAll('[data-mode]').forEach(button => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});
document.querySelectorAll('[data-view]').forEach(button => {
  button.addEventListener('click', () => view(button.dataset.view));
});
document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    model.userData.play(button.dataset.action);
    dom.menu.hidden = true;
    dom.menuBtn.setAttribute('aria-expanded', 'false');
  });
});
renderer.domElement.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  renderer.domElement.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  orbit = false;
  if (pointers.size === 2) {
    const p = [...pointers.values()];
    lastPinch = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  }
});
renderer.domElement.addEventListener('pointermove', event => {
  if (!pointers.has(event.pointerId)) return;
  const previous = pointers.get(event.pointerId);
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size === 2) {
    const p = [...pointers.values()];
    const length = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
    if (lastPinch > 0) distance = T.MathUtils.clamp(distance * lastPinch / length, 7, 25);
    lastPinch = length;
  } else {
    yaw -= (event.clientX - previous.x) * .008;
    pitch = T.MathUtils.clamp(pitch + (event.clientY - previous.y) * .004, -.35, .86);
  }
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  renderer.domElement.addEventListener(type, event => pointers.delete(event.pointerId));
}
renderer.domElement.addEventListener('wheel', event => {
  event.preventDefault();
  distance = T.MathUtils.clamp(distance * Math.exp(event.deltaY * .001), 7, 25);
}, { passive: false });
window.addEventListener('keydown', event => {
  if (event.code === 'KeyB') model.userData.play('bite');
  if (event.code === 'KeyJ') model.userData.play('jump');
  if (event.code === 'KeyW') setMode('wire');
  if (event.code === 'KeyN') setMode('normals');
  if (event.code === 'KeyR') view('orbit');
});
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / Math.max(1, innerHeight);
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
function frame(ms) {
  requestAnimationFrame(frame);
  const dt = Math.min(.045, Math.max(0, (ms - lastMs) / 1000));
  lastMs = ms;
  if (document.hidden) return;
  frameMS = frameMS * .95 + dt * 1000 * .05;
  if (frameMS > 38 && quality > .7) {
    quality = .7;
    renderer.setPixelRatio(1);
    painter.setQuality(.7);
    renderer.setSize(innerWidth, innerHeight);
  }
  elapsed += dt;
  if (orbit) yaw += dt * .22;
  model.userData.tick(elapsed, dt);
  const ease = 1 - Math.exp(-dt * 6);
  followYaw += (yaw - followYaw) * ease;
  followPitch += (pitch - followPitch) * ease;
  camera.position.set(
    target.x + Math.sin(followYaw) * Math.cos(followPitch) * distance,
    target.y + Math.sin(followPitch) * distance,
    target.z + Math.cos(followYaw) * Math.cos(followPitch) * distance
  );
  camera.lookAt(target);
  halo.rotation.z += dt * .025;
  painter.tick(ms);
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
window.__THREE_MASTER__ = {
  ready: true, inspect: () => inspectObject3D(model, { role: 'character' }),
  setMode, view, model, result
};
window.addEventListener('unhandledrejection', event => {
  dom.error.textContent = String(event.reason);
  dom.error.style.display = 'block';
});
window.addEventListener('error', event => {
  dom.error.textContent = String(event.message);
  dom.error.style.display = 'block';
});
