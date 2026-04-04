import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/PointerLockControls.js';

let camera, scene, renderer, controls;

// Detect mobile
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

// Desktop keys
const keys = { w: false, a: false, s: false, d: false };

// Mobile movement (GLOBAL for buttons)
window.moveForward = false;
window.moveBackward = false;
window.moveLeft = false;
window.moveRight = false;

init();

function init() {

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x222222);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 10000);
  camera.position.set(0, 5, 10);

  controls = new PointerLockControls(camera, document.body);

  // 👉 Only lock on desktop
  if (!isMobile) {
    document.addEventListener('click', () => controls.lock());
  }

  scene.add(controls.getObject());

  // Lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(1,1,1);
  scene.add(dirLight);

  // Load model
  fetch('./project.json')
    .then(res => res.json())
    .then(json => {
      const loader = new THREE.ObjectLoader();
      const result = loader.parse(json.scene);
      scene.add(result);

      if (json.camera) {
        const cam = loader.parse(json.camera);
        camera.position.copy(cam.position);
      }
    });

  // Desktop keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;
  });

  document.addEventListener('keyup', e => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
  });

  // 📱 Show mobile controls
  if (isMobile) {
    document.getElementById('mobileControls').style.display = 'block';
  }

  // 📱 Touch look (swipe to rotate)
  if (isMobile) {
    let prevX = 0;
    let prevY = 0;

    document.addEventListener('touchstart', (e) => {
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
    });

    document.addEventListener('touchmove', (e) => {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      const dx = x - prevX;
      const dy = y - prevY;

      prevX = x;
      prevY = y;

      controls.getObject().rotation.y -= dx * 0.002;
      camera.rotation.x -= dy * 0.002;

      // limit vertical look
      camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
    });
  }

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  const speed = 0.1;

  // Desktop movement
  if (keys.w) controls.moveForward(speed);
  if (keys.s) controls.moveForward(-speed);
  if (keys.a) controls.moveRight(-speed);
  if (keys.d) controls.moveRight(speed);

  // Mobile movement
  if (window.moveForward) controls.moveForward(speed);
  if (window.moveBackward) controls.moveForward(-speed);
  if (window.moveLeft) controls.moveRight(-speed);
  if (window.moveRight) controls.moveRight(speed);

  renderer.render(scene, camera);
}