import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
import { FakeGlowMaterial as FakeGlowMaterialWebGPU } from './FakeGlowMaterialWebGPU.js'
import { FakeGlowMaterial as FakeGlowWebGPU } from './FakeGlowGPU.js'
import FakeGlowMaterial from './FakeGlowMaterial.js';

const params = {
  falloff: .1,
  glowInternalRadius: 6,
  glowColor: new THREE.Color('#8039ea'),
  glowSharpness: .5,
  opacity: 1,
  toneMappingExposure: 1,
  depthTest: false,
}

const cotor = {
  0: FakeGlowMaterial,
  1: FakeGlowMaterialWebGPU,
  2: FakeGlowWebGPU,
}

function initScene(isWebGPU) {
  /**
   * Scene
   */
  const canvas = document.querySelector(isWebGPU === 1 ? 'canvas.webgpu' : isWebGPU === 2 ? 'canvas.newWebgpu' : 'canvas.webgl')
  const scene = new THREE.Scene()

  /**
   * ScreenResolution
   */
  const screenRes = {
    width: window.innerWidth,
    height: window.innerHeight / 3
  }

  window.addEventListener('resize', () => {
    screenRes.width = window.innerWidth
    screenRes.height = window.innerHeight / 3

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
  ambientLight.intensity = .1
  scene.add(ambientLight)

  /**
   * Renderer
   */
  const renderer = new ([1, 2].includes(isWebGPU) ? WebGPURenderer : THREE.WebGLRenderer)({
    canvas: canvas,
    powerPreference: 'high-performance',
    antialias: true,
  })

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
  // scene.add(skyBox)
  skyBox.rotation.y = -1

  /**
   * FakeGlow Material and Mesh
   */

  const fakeGlowMaterial = isWebGPU ? new FakeGlowMaterialWebGPU(params) : new FakeGlowMaterial(params);
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

  const tick = () => {
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
  }
  
  tick();

  return [fakeGlowMaterial, renderer];
}

const [fakeGlowMaterialWebGPU, webgpu] = initScene(1);
const [fakeGlowMaterial, webgl] = initScene(0);
const [newFakeGlowMaterial, newWebGPU] = initScene(2);

/**
 * Set up the GUI for manipulating parameters
 */
const gui = new dat.GUI()

gui
  .add(params, 'falloff')
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((falloff) => {
    fakeGlowMaterial.uniforms.falloff.value = falloff;
    fakeGlowMaterialWebGPU.uFalloff.value = falloff;
    newFakeGlowMaterial.uFalloff.value = falloff;
  })
  .name('Falloff');
gui
  .add(params, 'glowInternalRadius')
  .min(-10)
  .max(10)
  .step(0.01)
  .onChange((glowInternalRadius) => {
    fakeGlowMaterial.uniforms.glowInternalRadius.value = glowInternalRadius;
    fakeGlowMaterialWebGPU.uGlowInternalRadius.value = glowInternalRadius;
    newFakeGlowMaterial.uGlowInternalRadius.value = glowInternalRadius;
  })
  .name('Glow Internal Radius');
gui
  .addColor(
    {
      GlowColor: params.glowColor.getStyle()
    },
    'GlowColor'
  )
  .onChange((color) => {
    fakeGlowMaterial.uniforms.glowColor.value.setStyle(color);
    fakeGlowMaterialWebGPU.uGlowColor.value = new THREE.Color(color);
    newFakeGlowMaterial.uGlowColor.value = new THREE.Color(color);
  })
  .name('Glow Color');
gui
  .add(params, 'glowSharpness')
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((glowSharpness) => {
    fakeGlowMaterial.uniforms.glowSharpness.value = glowSharpness;
    fakeGlowMaterialWebGPU.uGlowSharpness.value = glowSharpness;
    newFakeGlowMaterial.uGlowSharpness.value = glowSharpness;
  })
  .name('Glow Sharpness');
gui
  .add(params, 'opacity')
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((opacity) => {
    fakeGlowMaterial.uniforms.opacity.value = opacity;
    fakeGlowMaterialWebGPU.uOpacity.value = opacity;
    newFakeGlowMaterial.uOpacity.value = opacity;
  })
  .name('Opacity');


gui
  .add(params, 'toneMappingExposure')
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((toneMappingExposure) => {
    // fakeGlowMaterialWebGPU.uToneMappingExposure.value = toneMappingExposure;
    webgpu.toneMappingExposure = toneMappingExposure;
    webgl.toneMappingExposure = toneMappingExposure;
    newWebGPU.toneMappingExposure = toneMappingExposure;
  })
  .name('ToneMappingExposure');
// gui
//   .add(fakeGlowMaterial, 'side')
//   .options({
//     front: 0,
//     back: 1,
//     double: 2,
//   })
//   .name('ToneMappingExposure');
// gui
//   .add(params, 'depthTest')
//   .enable()
//   .onChange((depthTest) => {
//     fakeGlowMaterialWebGPU.depthTest = depthTest;
//   })
//   .name('DepthTest');
// gui
//   .add(fakeGlowMaterial, 'blending')
//   .options({
//     noBlending: 0,
//     normal: 1,
//     add: 2,
//     subtract: 3,
//     multiply: 4,
//   })
//   .name('BlendMode');
// gui
//   .add(renderer, 'toneMapping')
//   .options({
//     NoToneMapping: 0,
//     LinearToneMapping: 1,
//     ReinhardToneMapping: 2,
//     CineonToneMapping: 3,
//     ACESFilmicToneMapping: 4,
//   })
//   .name('ToneMapping')
//   .onChange(tick);
