// ---- dev overlay for gh-pages ----
(function () {
  const box = document.createElement('pre');
  box.style.cssText =
    'position:fixed;left:8px;bottom:8px;z-index:9999;max-width:90vw;max-height:40vh;overflow:auto;padding:8px 10px;background:#111;color:#f55;border:1px solid #333;border-radius:8px;font:12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;display:none';
  function show(msg) { box.style.display = 'block'; box.textContent = String(msg); }
  window.addEventListener('error', e => show(e.error?.stack || e.message || e));
  window.addEventListener('unhandledrejection', e => show(e.reason?.stack || e.reason || e));
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
})();

import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Автоподхват изображений из src/assets.
// Исключаем GIF (очень тяжёлые) и берём только png/jpg/webp.
const ctx = require.context('./assets', false, /\.(png|jpe?g|webp)$/i)
const ALL_URLS = ctx.keys().map(ctx)

// Чтобы не валить WebGL сотнями текстур сразу — ограничим количество (потом поднимем).
const URLS = ALL_URLS.slice(0, 120)

if (URLS.length === 0) {
  throw new Error('Нет картинок в src/assets (png/jpg/webp).')
}

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0, 8)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const group = new THREE.Group()
scene.add(group)

const RADIUS = 3.5
const TILE = 0.9

function fibonacciSphere(N, radius) {
  const pts = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / Math.max(N - 1, 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    const x = Math.cos(theta) * r
    const z = Math.sin(theta) * r
    pts.push(new THREE.Vector3(x, y, z).multiplyScalar(radius))
  }
  return pts
}

const count = Math.max(URLS.length, 3)
const points = fibonacciSphere(count, RADIUS)
const plane = new THREE.PlaneGeometry(TILE, TILE)

// Настройки текстур: мипмапы + фильтры помягче, чуть анизотропии.
const loader = new THREE.TextureLoader()
const maxAniso = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1

points.forEach((p, i) => {
  const texUrl = URLS[i % URLS.length]
  const tex = loader.load(
    texUrl,
    t => {
      t.colorSpace = THREE.SRGBColorSpace
      t.generateMipmaps = true
      t.minFilter = THREE.LinearMipmapLinearFilter
      t.magFilter = THREE.LinearFilter
      t.anisotropy = Math.min(4, maxAniso || 1)
    },
    undefined,
    err => { console.error('Texture load failed:', texUrl, err) }
  )

  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  const mesh = new THREE.Mesh(plane, mat)
  mesh.position.copy(p)
  mesh.lookAt(p.clone().multiplyScalar(2)) // лицом наружу
  group.add(mesh)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

function tick() {
  group.rotation.y += 0.002
  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
tick()
