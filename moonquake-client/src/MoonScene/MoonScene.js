import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import textureImg from "../Assets/texture.png";
import displacementImg from "../Assets/displacement.png";
import apolloModel from "../Assets/apollo_lunar.obj";
import apolloModelMap from "../Assets/apollo map.jpg";
import { getHemisphereLight } from "./HemisphereLight";
import { landings } from "./landings";
import { getBackground } from "./Background";
import moment from "moment";
import apollo16data from "../MoonScene/s16.json";

const dataMapper = {
  apollo16: apollo16data,
};

const MOON_RADIUS = 10;

const materialLow = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  side: THREE.DoubleSide,
});

const materialMid = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide,
});

const materialHigh = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  side: THREE.DoubleSide,
});

const placeObjectOnPlanet = (object, lat, lon, radius) => {
  var latRad = lat * (Math.PI / 180);
  var lonRad = -lon * (Math.PI / 180);
  object.position.set(
    Math.cos(latRad) * Math.cos(lonRad) * radius,
    Math.sin(latRad) * radius,
    Math.cos(latRad) * Math.sin(lonRad) * radius
  );
  object.rotation.set(0.0, -lonRad + Math.PI, -(latRad - Math.PI * 0.5));
};

// ---- Object Configuration ----
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.setZ(30);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 12;
controls.maxDistance = 70;

scene.add(getHemisphereLight());

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(textureImg);
const displacementMap = textureLoader.load(displacementImg);

const background = new THREE.Mesh(
  getBackground().backgroundGeometry,
  getBackground().backgroundMaterial
);
scene.add(background); // TODO: add effect

const light = new THREE.AmbientLight(0x404040, 4);
// const light = new THREE.DirectionalLight(0xffffff, 1); // TODO: return to be realistic
light.position.set(-100, 10, 50); // TODO: add effect
light.position.set(0, 10, 50);
scene.add(light);

// ---- Three Objects ----
// ---- MOON OBJECT ----

const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 1000, 1000);
const moonMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  map: texture,
  displacementMap: displacementMap,
  displacementScale: 0.06,
  bumpMap: displacementMap,
  bumpScale: 0.04,
  reflectivity: 0,
  shininess: 0,
});

const moon = new THREE.Mesh(moonGeometry, moonMaterial);

moon.rotation.x = 3.1415 * 0.02;
moon.rotation.y = 3.1415 * 1.54;

scene.remove(moon);

// ---- SEISMOGRAPH OBJECT ----

// ---- NORTH SOUTH MARKERS ----
const box_size = 0.5;
const north = new THREE.Mesh(
  new THREE.BoxGeometry(box_size, box_size, box_size),
  new THREE.MeshToonMaterial()
);
north.position.set(0, MOON_RADIUS + box_size / 2, 0);

const south = new THREE.Mesh(
  new THREE.BoxGeometry(box_size, box_size, box_size),
  new THREE.MeshToonMaterial()
);
south.position.set(0, -(MOON_RADIUS + box_size / 2), 0);

// ---- LANDINGS MARKERS ----

const group = new THREE.Group();

Object.keys(landings).map(async (landingKey) => {
  const landingData = landings[landingKey];
  const landingObjTexture = await new THREE.TextureLoader().loadAsync(
    apolloModelMap
  );

  const landingObj = await new OBJLoader().loadAsync(apolloModel);

  landingObj.traverse((child) => {
    if (child.isMesh) {
      child.material.map = landingObjTexture;
      child.geometry.computeVertexNormals();
    }
  });

  landingObj.scale.x = landingObj.scale.y = landingObj.scale.z = 0.005;
  placeObjectOnPlanet(
    landingObj,
    landingData.lat,
    landingData.lon,
    MOON_RADIUS
  );

  group.add(landingObj);
});

// ---- MARK EARTHQUAKES ----

const landingObjects = [];

Object.keys(landings).map(async (landingKey) => {
  const landingData = landings[landingKey];

  const geometry = new THREE.SphereGeometry(
    MOON_RADIUS,
    64,
    1,
    6.28,
    6.28,
    0.01,
    0.05
  );
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
  });
  const sphere = new THREE.Mesh(geometry, material);

  placeObjectOnPlanet(sphere, landingData.lat, landingData.lon, 0.08);
  sphere.userData = { landingKey };
  landingObjects.push(sphere);
});

landingObjects.forEach((x) => group.add(x));

// ---- GROUP OBJECTS ----

const axesHelper = new THREE.AxesHelper(20);
group.add(axesHelper);

group.add(north);
group.add(south);
group.add(moon);
scene.add(group);

// -------- update spheres ------
const updateSpheres = () => {
  landingObjects.forEach((obj) => {
    const landingKey = obj.userData.landingKey;
    if (landingKey === "apollo16") {
      const usualRingGeom = new THREE.SphereGeometry(
        MOON_RADIUS,
        64,
        1,
        6.28,
        6.28,
        0.01,
        0.05
      );
      // obj.material = Math.random() > 0.5 ? materialHigh : materialLow;
      obj.geometry.dispose();
      obj.geometry = usualRingGeom;
    }
  });
};

// ---- Configuration ----

const animate = () => {
  requestAnimationFrame(animate);

  updateSpheres();

  // group.rotation.y += 0.002; // TODO: add effect
  // group.rotation.x += 0.0001; // TODO: add effect
  // background.rotation.y += 0.0001; // TODO: add effect
  // background.rotation.x += 0.0005; // TODO: add effect

  renderer.render(scene, camera);
};
animate();

const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", onResize, false);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
