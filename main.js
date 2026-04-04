import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/PointerLockControls.js';

let camera, scene, renderer, controls;

const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

init();

function init() {
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x222222);
  document.body.appendChild(renderer.domElement);

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 5, 10); // starting position

  // Controls (FPS)
  controls = new PointerLockControls(camera, document.body);

  document.addEventListener('click', () => {
    controls.lock(); // click to start
  });

  scene.add(controls.getObject());

  // Lights
  const light1 = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 2);
  light2.position.set(1, 1, 1);
  scene.add(light2);

  // Load your project.json
  fetch('./project.json')
    .then(res => res.json())
    .then(json => {
      const loader = new THREE.ObjectLoader();

      // 🔥 Important: load scene only
      const result = loader.parse(json.scene);
      scene.add(result);

      // Optional: use saved camera
      if (json.camera) {
        const cam = loader.parse(json.camera);
        camera.position.copy(cam.position);
      }
    });

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
  });

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  const speed = 0.1;

  if (keys.w) controls.moveForward(speed);
  if (keys.s) controls.moveForward(-speed);
  if (keys.a) controls.moveRight(-speed);
  if (keys.d) controls.moveRight(speed);

  renderer.render(scene, camera);
}