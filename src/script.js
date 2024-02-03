import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import FakeGlowMaterial from './FakeGlowMaterial.js'

/**
 * Scene
 */
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

/**
 * ScreenResolution
 */
const screenRes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  screenRes.width = window.innerWidth
  screenRes.height = window.innerHeight

  camera.aspect = screenRes.width / screenRes.height
  camera.updateProjectionMatrix()

  renderer.setSize(screenRes.width, screenRes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  35,
  screenRes.width / screenRes.height,
  1,
  1000
)
camera.position.set(0, 0, 6)
scene.add(camera)

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxDistance = 8
controls.minDistance = 2
controls.maxPolarAngle = Math.PI / 1.7
controls.minPolarAngle = 1.1
controls.autoRotate = true
controls.target.set(0, -0.3, 0)

/**
 * Lights
 */
const light = new THREE.DirectionalLight()
light.intensity = 1
light.position.set(-20, 20, 50)
scene.add(light)

const ambientLight = new THREE.AmbientLight()
ambientLight.intensity = 0.1
scene.add(ambientLight)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  powerPreference: 'high-performance',

})
// renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(screenRes.width, screenRes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))

/**
 * SkyBox
 */
const geometry = new THREE.SphereGeometry(6, 40, 40)
const texture = new THREE.TextureLoader().load('background2.jpg')
texture.flipY = true
const material = new THREE.MeshStandardMaterial({
  map: texture,
  side: THREE.BackSide,
})

const skyBox = new THREE.Mesh(geometry, material)
scene.add(skyBox)
skyBox.rotation.y = -1

/**
 * FakeGlow Material and Mesh
 */

const fakeGlowMaterial = new FakeGlowMaterial({ glowColor: '#8039ea' })
const torusMesh = new THREE.TorusKnotGeometry(0.8, 0.5, 128, 128)
const Torus = new THREE.Mesh(torusMesh, fakeGlowMaterial)
scene.add(Torus)

/**
 * Torus with MeshPhysicalMaterial and Mesh
 */

const torusMaterial = new THREE.MeshPhysicalMaterial({ color: '#2babab', roughness: 0.2, clearcoat: 1 })
const torusMesh2 = new THREE.TorusKnotGeometry(0.8, 0.1, 128, 128)
const Torus2 = new THREE.Mesh(torusMesh2, torusMaterial)
scene.add(Torus2)

/**
 * Set up the GUI for manipulating parameters
 */
const gui = new dat.GUI()

gui
  .add(fakeGlowMaterial.uniforms.falloff, 'value')
  .min(0)
  .max(1)
  .step(0.01)
  .name('Falloff');
gui
  .add(fakeGlowMaterial.uniforms.glowInternalRadius, 'value')
  .min(-10)
  .max(10)
  .step(0.01)
  .name('Glow Internal Radius');
gui
  .addColor(
    {
      GlowColor: fakeGlowMaterial.uniforms.glowColor.value.getStyle()
    },
    'GlowColor'
  )
  .onChange((color) => {
    fakeGlowMaterial.uniforms.glowColor.value.setStyle(color);
    fakeGlowMaterial.needsUpdate = true;
  })
  .name('Glow Color');
gui
  .add(fakeGlowMaterial.uniforms.glowSharpness, 'value')
  .min(0)
  .max(1)
  .step(0.01)
  .name('Glow Sharpness');
gui
  .add(fakeGlowMaterial.uniforms.opacity, 'value')
  .min(0)
  .max(1)
  .step(0.01)
  .name('Opacity');



/**
 * Animate
 */
const tick = () => {
  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()
