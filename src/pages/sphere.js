// Sphere page runtime (module)
// Uses local images from ../images/manifest.json

(function () {
  const box = document.createElement('pre');
  box.style.cssText =
    'position:fixed;left:8px;bottom:8px;z-index:9999;max-width:90vw;max-height:40vh;overflow:auto;padding:8px 10px;background:#111;color:#f55;border:1px solid #333;border-radius:8px;font:12px/1.4 ui-monospace,Menlo,monospace;display:none';
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  function show(msg) {
    box.style.display = 'block';
    box.textContent = String(msg);
  }
  window.__sphereShowError = show;
  window.addEventListener('error', (e) => show(e.error?.stack || e.message || e));
  window.addEventListener('unhandledrejection', (e) => show(e.reason?.stack || e.reason || e));
})();

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

async function loadImageUrls() {
  try {
    const res = await fetch('../images/manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`manifest request failed: ${res.status}`);
    const files = await res.json();
    if (!Array.isArray(files)) throw new Error('manifest is not an array');
    return files
      .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      .map((f) => `../images/${f}`);
  } catch (err) {
    if (window.__sphereShowError) {
      window.__sphereShowError(`Manifest load error: ${err.message}`);
    }
    return [];
  }
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeRoundedRectAlpha(size = 512, radius = 22) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');

  g.clearRect(0, 0, size, size);
  g.fillStyle = '#fff';

  const r = Math.min(radius, size / 2);
  const w = size;
  const h = size;

  g.beginPath();
  g.moveTo(r, 0);
  g.lineTo(w - r, 0);
  g.quadraticCurveTo(w, 0, w, r);
  g.lineTo(w, h - r);
  g.quadraticCurveTo(w, h, w - r, h);
  g.lineTo(r, h);
  g.quadraticCurveTo(0, h, 0, h - r);
  g.lineTo(0, r);
  g.quadraticCurveTo(0, 0, r, 0);
  g.closePath();
  g.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function fibonacciSphere(count, radius) {
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    points.push(new THREE.Vector3(x, y, z).multiplyScalar(radius));
  }

  return points;
}

async function init() {
  const imageUrlsRaw = await loadImageUrls();
  const imageUrls = shuffle(imageUrlsRaw).slice(0, Math.max(24, Math.min(imageUrlsRaw.length, 120)));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xFAFAFA, 1);

  document.body.style.background = '#FAFAFA';
  document.body.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const RADIUS = 3.6;
  const TILE = 0.72;

  const alphaMask = makeRoundedRectAlpha(512, 22);
  const geometry = new THREE.PlaneGeometry(TILE, TILE);
  const points = fibonacciSphere(Math.max(imageUrls.length, 24), RADIUS);

  const loader = new THREE.TextureLoader();

  points.forEach((point, i) => {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xeeeeee,
      alphaMap: alphaMask,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.15,
    });

    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.copy(point);
    mesh.lookAt(point.clone().multiplyScalar(2));
    group.add(mesh);

    const url = imageUrls[i % Math.max(imageUrls.length, 1)];
    if (!url) return;

    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        mat.map = tex;
        mat.color.set(0xffffff);
        mat.needsUpdate = true;
      },
      undefined,
      () => {
        // keep neutral fallback tile
      }
    );
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function tick() {
    group.rotation.y += 0.002;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}

init();
