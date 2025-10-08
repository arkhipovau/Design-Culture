import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Автоподхват изображений из src/assets (jpg/jpeg/png/webp)
const req = require.context('./assets', false, /\.(png|jpe?g|webp)$/)
const urls = req.keys().map(req)

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

const count = Math.max(urls.length, 3)
const points = fibonacciSphere(count, RADIUS)
const plane = new THREE.PlaneGeometry(TILE, TILE)
const loader = new THREE.TextureLoader()

points.forEach((p, i) => {
  const texUrl = urls[i % Math.max(urls.length, 1)]
  const tex = loader.load(texUrl)
  tex.colorSpace = THREE.SRGBColorSpace
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  const mesh = new THREE.Mesh(plane, mat)
  mesh.position.copy(p)
  mesh.lookAt(p.clone().multiplyScalar(2))
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
