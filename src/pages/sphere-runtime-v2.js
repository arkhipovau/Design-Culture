
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

const FALLBACK_IMAGE_FILES = [
  '8a6ae07d69c4e874b52c.jpg',
  'd801538041a9350ba5d2.webp',
  '513f0a449c59e7eb2dcb.webp',
  '8c30a668aa8d06217ed6.webp',
  '45603f1b4adcc73ea37b.jpg',
  '86c2cda628bf2b209a91.webp',
  '324b9db98c5f779e2f2c.jpg',
  '5797605502626eb5eaa3.jpg',
  '1d0536b32e76aa8ad169.webp',
  'c25d1847bc1ef5479f62.webp',
  '0237d06fef5459819fb4.webp',
  'ca62f442cf615b875906.webp',
  '0e33494abc2193d45071.jpg',
  'ee6efa91848e07840982.webp',
  '021b91e97f3a271d2d59.webp',
  'fd0ea6238b2fd03feb38.jpg',
  '40e2b54269cdc31ad913.png',
  '28312b8b4b547b0e8974.png',
  '359b9d0fb7d97121e465.jpg',
  '96f7d4116789d1f7784d.webp',
];

const IMAGES_BASE = new URL('../images/', window.location.href);

function resolveImageUrl(file) {
  return new URL(String(file).replace(/^\//, ''), IMAGES_BASE).href;
}

function fallbackImageUrls() {
  return FALLBACK_IMAGE_FILES.map(resolveImageUrl);
}

function notifyParentReady() {
  if (!isEmbedded || window.parent === window) return;
  try {
    window.parent.postMessage({ type: 'sphere-ready' }, '*');
  } catch (_) {
    /* ignore */
  }
}

const searchParams = new URLSearchParams(window.location.search);
const isEmbedded = searchParams.get('embed') === '1' || document.body.dataset.embed === '1';
const requestedSphereScale = Number(searchParams.get('sphereScale') || '1');
const sphereScale = Number.isFinite(requestedSphereScale)
  ? Math.min(1.5, Math.max(0.4, requestedSphereScale))
  : 1;

function getLayoutSphereMultiplier() {
  const w = window.innerWidth;
  if (isEmbedded) {
    if (w <= 420) return 0.68;
    if (w <= 768) return 0.72;
    if (w <= 1200) return 0.82;
    return 1;
  }
  if (w <= 420) return 0.85;
  if (w <= 1200) return 0.82;
  return 1;
}

function getEmbeddedGroupYOffset() {
  if (!isEmbedded) return 0;
  const w = window.innerWidth;
  if (w <= 420) return 0.32;
  if (w <= 768) return 0.38;
  return 0;
}

if (isEmbedded) {
  const nav = document.querySelector('nav');
  if (nav) nav.style.display = 'none';
}

async function loadImageUrls() {
  if (window.location.protocol === 'file:') {
    return fallbackImageUrls();
  }

  try {
    const res = await fetch('../images/manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`manifest request failed: ${res.status}`);
    const files = await res.json();
    if (!Array.isArray(files)) throw new Error('manifest is not an array');
    const urls = files
      .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      .map(resolveImageUrl);
    return urls.length ? urls : fallbackImageUrls();
  } catch (err) {
    if (window.__sphereShowError) {
      window.__sphereShowError(`Manifest load error: ${err.message}. Using fallback image set.`);
    }
    return fallbackImageUrls();
  }
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeRoundedRectAlpha(THREE, size = 512, radius = 22) {
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

function fibonacciSphere(THREE, count, radius) {
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

function showFileProtocolFallback() {

  document.body.style.background = '#FAFAFA';
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px;font:14px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#666;background:#FAFAFA;text-align:center;';
  const img = document.createElement('img');
  img.src = resolveImageUrl(FALLBACK_IMAGE_FILES[0]);
  img.alt = '';
  img.style.cssText = 'max-width:80%;max-height:70vh;opacity:0.35;filter:grayscale(0.4);';
  img.onerror = function () { img.style.display = 'none'; };
  const note = document.createElement('div');
  note.style.cssText = 'max-width:380px;color:#999;font-size:13px;';
  note.textContent =
    'Интерактивная сфера показывается только при запуске через локальный сервер: npm run dev:webpack — или открыть страницу на GitHub Pages.';
  wrap.appendChild(img);
  wrap.appendChild(note);
  document.body.appendChild(wrap);
}

async function init() {
  const THREE = window.THREE;
  if (!THREE) {
    if (window.__sphereShowError) {
      window.__sphereShowError('THREE is not loaded.');
    }
    return;
  }

  if (window.location.protocol === 'file:') {
    showFileProtocolFallback();
    return;
  }

  const imageUrlsRaw = await loadImageUrls();

  let layoutMult = getLayoutSphereMultiplier();
  const visualScale = sphereScale * layoutMult;

  const targetTileCount = isEmbedded
    ? window.innerWidth <= 767
      ? 48
      : 64
    : 112;
  const imageUrls = shuffle(imageUrlsRaw).slice(0, Math.max(24, Math.min(imageUrlsRaw.length, targetTileCount)));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  const baseCameraZ = layoutMult < 0.75 ? 9.2 : 8;
  camera.position.set(0, 0, baseCameraZ);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: !isEmbedded,
    powerPreference: 'high-performance'
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isEmbedded ? 2 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xFAFAFA, 1);

  if ('outputColorSpace' in renderer) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }

  document.body.style.background = '#FAFAFA';
  document.body.appendChild(renderer.domElement);

  const group = new THREE.Group();
  group.position.y = getEmbeddedGroupYOffset();
  scene.add(group);

  const RADIUS = 3.6 * visualScale;
  const TILE = 0.82 * visualScale; 

  const alphaMask = makeRoundedRectAlpha(THREE, 1024, 38);
  const geometry = new THREE.PlaneGeometry(TILE, TILE);
  const points = fibonacciSphere(THREE, Math.max(imageUrls.length, 24), RADIUS);

  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  let loadedTextures = 0;
  let failedTextures = 0;
  let parentNotified = false;
  const expectedTextures = points.length;
  const notifyThreshold = Math.min(12, Math.max(4, Math.floor(expectedTextures * 0.15)));

  points.forEach((point, i) => {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xeeeeee,
      alphaMap: alphaMask,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0,
      depthWrite: false,
      opacity: 0.82
    });

    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.copy(point);
    mesh.lookAt(point.clone().multiplyScalar(2));

    mesh.renderOrder = -point.z;
    group.add(mesh);

    const url = imageUrls[i % Math.max(imageUrls.length, 1)];
    if (!url) return;

    loader.load(
      url,
      (tex) => {
        loadedTextures += 1;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = maxAniso;
        tex.generateMipmaps = true;
        mat.map = tex;
        mat.color.set(0xffffff);
        mat.needsUpdate = true;
        if (!parentNotified && loadedTextures >= notifyThreshold) {
          parentNotified = true;
          notifyParentReady();
        }
      },
      undefined,
      () => {
        failedTextures += 1;

      }
    );
  });

  window.setTimeout(() => {
    if (loadedTextures > 0 && !parentNotified) {
      parentNotified = true;
      notifyParentReady();
    }
    if (loadedTextures === 0 && failedTextures > 0 && window.__sphereShowError) {
      window.__sphereShowError(
        `Textures did not load (${failedTextures}/${expectedTextures}). ` +
          `Usually this is browser cache or file:// restrictions. Reload hard or run via local server.`
      );
    }
  }, 3500);

  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let targetZoom = camera.position.z;
  let currentZoom = camera.position.z;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  const onPointerDown = (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    renderer.domElement.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    targetRotY += dx * 0.005;
    targetRotX += dy * 0.003;
    targetRotX = Math.max(-0.9, Math.min(0.9, targetRotX));
  };

  const onPointerUp = (e) => {
    isDragging = false;
    renderer.domElement.releasePointerCapture?.(e.pointerId);
  };

  const onWheel = (e) => {
    e.preventDefault();
    targetZoom += e.deltaY * 0.002;
    targetZoom = Math.max(4.5, Math.min(14, targetZoom));
  };

  renderer.domElement.style.touchAction = isEmbedded ? 'pan-y' : 'none';

  if (!isEmbedded) {
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  }

  window.addEventListener('resize', () => {
    const nextMult = getLayoutSphereMultiplier();
    if (nextMult !== layoutMult) {
      const ratio = nextMult / layoutMult;
      group.scale.multiplyScalar(ratio);
      layoutMult = nextMult;
    }

    group.position.y = getEmbeddedGroupYOffset();

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function tick() {
    if (!isDragging) targetRotY += 0.002;

    currentRotX += (targetRotX - currentRotX) * 0.08;
    currentRotY += (targetRotY - currentRotY) * 0.08;
    currentZoom += (targetZoom - currentZoom) * 0.12;

    group.rotation.x = currentRotX;
    group.rotation.y = currentRotY;
    camera.position.z = currentZoom;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}

init();
