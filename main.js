import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/PointerLockControls.js';

let camera, scene, renderer, controls;

const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

// Desktop keys
const keys = { w: false, a: false, s: false, d: false };

// Mobile movement
window.moveForward = false;
window.moveBackward = false;
window.moveLeft = false;
window.moveRight = false;

// Mobile rotation values
let yaw = 0;
let pitch = 0;

init();

function init() {

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x222222);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 10000);
  camera.position.set(0, 1.6, 5);

  // 👉 Desktop only controls
  if (!isMobile) {
    controls = new PointerLockControls(camera, document.body);

    document.addEventListener('click', () => controls.lock());

    scene.add(controls.getObject());
  }

  // Lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(1,1,1);
  scene.add(light);

  // Load model
  fetch('./project.json')
    .then(res => res.json())
    .then(json => {
      const loader = new THREE.ObjectLoader();
      const result = loader.parse(json.scene);
      scene.add(result);
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

  // 📱 Show mobile UI
  if (isMobile) {
    document.getElementById('mobileControls').style.display = 'block';
  }

  // 📱 TOUCH LOOK (NO pointer lock)
  if (isMobile) {
    let prevX = 0;
    let prevY = 0;

    document.addEventListener('touchstart', e => {
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
    });

    document.addEventListener('touchmove', e => {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      const dx = x - prevX;
      const dy = y - prevY;

      prevX = x;
      prevY = y;

      yaw -= dx * 0.003;
      pitch -= dy * 0.003;

      pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));

      camera.rotation.set(pitch, yaw, 0);
    });
  }

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  const speed = 0.08;

  // Desktop movement
  if (!isMobile && controls) {
    if (keys.w) controls.moveForward(speed);
    if (keys.s) controls.moveForward(-speed);
    if (keys.a) controls.moveRight(-speed);
    if (keys.d) controls.moveRight(speed);
  }

  // Mobile movement
  if (isMobile) {
    const direction = new THREE.Vector3();

    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction).normalize();

    if (window.moveForward) camera.position.add(direction.multiplyScalar(speed));
    if (window.moveBackward) camera.position.add(direction.multiplyScalar(-speed));
    if (window.moveLeft) camera.position.add(right.multiplyScalar(speed));
    if (window.moveRight) camera.position.add(right.multiplyScalar(-speed));
  }

  renderer.render(scene, camera);
}