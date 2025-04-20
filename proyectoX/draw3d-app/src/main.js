import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let camera, scene, renderer, raycaster, mouse, controls;
let isDrawing = false;
let isSpacePressed = false;
let lastPoint = null;
const drawingPlanes = [];

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0xffffff); // <-- color de fondo (puedes cambiarlo)

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1));

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  //Moverse lateralmente
  controls.screenSpacePanning = true; // Esto activa el pan en el plano XY en lugar de Z
  controls.enablePan = true;

  // —— Zoom con Ctrl + scroll —— 
  // Mueve la cámara adelante/atrás evitando el zoom de la página
  const zoomSpeed = 0.5; // Ajusta sensibilidad

  renderer.domElement.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();  // bloquea el zoom del navegador
      // translateZ mueve la cámara a lo largo de su eje local Z
      camera.translateZ(e.deltaY * 0.01 * zoomSpeed);
    }
  }, { passive: false });


  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', () => {
    isDrawing = false;
    lastPoint = null;
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') isSpacePressed = true;
    if (e.key === '1') {
      addDrawingPlane(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1)); // XY
    }
    if (e.key === '2') {
      addDrawingPlane(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)); // YZ
    }
    if (e.key === '3') {
      addDrawingPlane(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)); // XZ
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') isSpacePressed = false;
  });


  const gridHelper = new THREE.GridHelper(100, 100);
  scene.add(gridHelper);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // Crear guía física (plano de dibujo)
  const guideGeometry = new THREE.PlaneGeometry(5, 5);
  const guideMaterial = new THREE.MeshBasicMaterial({
    color: 0xdddddd,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3,
  });
  const guidePlane = new THREE.Mesh(guideGeometry, guideMaterial);
  guidePlane.name = 'drawingPlane'; // identificador opcional
  scene.add(guidePlane);

  addDrawingPlane(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1)); // guía inicial (XY)
}

function addDrawingPlane(position, normal) {
  const planeSize = 10;
  const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
  const material = new THREE.MeshBasicMaterial({
    color: 0xeeeeee,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.1
  });



  const planeMesh = new THREE.Mesh(geometry, material);

  // Orientación: el vector normal define hacia dónde "mira" el plano
  const up = new THREE.Vector3(0, 0, 1);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal.clone().normalize());
  planeMesh.quaternion.copy(quaternion);

  // Posición
  planeMesh.position.copy(position);

  scene.add(planeMesh);
  drawingPlanes.push({ mesh: planeMesh, normal: normal.clone() });
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function getDrawingPoint(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Intersectar contra la guía física
  const intersects = raycaster.intersectObject(scene.getObjectByName('drawingPlane'));

  if (intersects.length > 0) {
    return intersects[0].point.clone(); // punto exacto sobre la guía
  }

  return null; // no hay intersección
}



function onPointerDown(event) {
  if (!isSpacePressed) {
    const point = getDrawingPoint(event);
    if (point) {
      isDrawing = true;
      lastPoint = point;
    }
  }
}


function onPointerMove(event) {
  if (!isSpacePressed && isDrawing) {
    const newPoint = getDrawingPoint(event);
    if (newPoint && lastPoint) {
      const geometry = new THREE.BufferGeometry().setFromPoints([lastPoint, newPoint]);
      const material = new THREE.LineBasicMaterial({ color: 0x000000 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      lastPoint = newPoint;
    }
  }
}


function animate() {
  requestAnimationFrame(animate);
  controls.enabled = isSpacePressed;
  controls.update();
  renderer.render(scene, camera);
}

