import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import textureImg from "../Assets/texture.png";
import displacementImg from "../Assets/displacement.png";
import apolloModel from "../Assets/apollo_lunar.obj";
import { getHemisphereLight } from "./HemisphereLight";
import { getBackground } from "./Background";
import { landings } from "./landings";
import { render } from "@testing-library/react";

const MOON_RADIUS = 10;

const placeObjectOnPlanet = (object, lat, lon, radius) => {
  var latRad = lat * (Math.PI / 180);
  var lonRad = -lon * (Math.PI / 180);
  object.position.set(
    Math.cos(latRad) * Math.cos(lonRad) * radius,
    Math.sin(latRad) * radius,
    Math.cos(latRad) * Math.sin(lonRad) * radius
  );
  object.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);
};

const MoonScene = () => {
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

  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.5;

  const renderScene = new RenderPass(scene, camera);
  const composer = new EffectComposer(renderer);

  composer.addPass(renderScene);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.6,
    0.1,
    0.1
  );
  composer.addPass(bloomPass);

  bloomPass.strength = 0.5;
  bloomPass.radius = 5;
  bloomPass.threshold = 0.1;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 12;
  controls.maxDistance = 70;

  const axesHelper = new THREE.AxesHelper(20);
  scene.add(axesHelper);

  scene.add(getHemisphereLight());

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textureImg);
  const displacementMap = textureLoader.load(displacementImg);

  // const background = new THREE.Mesh(
  //   getBackground().backgroundGeometry,
  //   getBackground().backgroundMaterial
  // );
  // scene.add(background); // TODO: add effect

  const light = new THREE.DirectionalLight(0xffffff, 1);
  // light.position.set(-100, 10, 50); // TODO: add effect
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
    const objLoader = new OBJLoader();
    const landingObj = await objLoader.loadAsync(apolloModel);
    landingObj.scale.x = landingObj.scale.y = landingObj.scale.z = 0.005;
    placeObjectOnPlanet(
      landingObj,
      landingData.lat,
      landingData.lon,
      MOON_RADIUS
    );

    group.add(landingObj);
  });

  // ---- GROUP OBJECTS ----

  group.add(north);
  group.add(south);
  group.add(moon);
  scene.add(group);

  // ---- Configuration ----

  const animate = () => {
    // moon.rotation.y += 0.002; // TODO: add effect
    // moon.rotation.x += 0.0001; // TODO: add effect
    // background.rotation.y += 0.0001; // TODO: add effect
    // background.rotation.x += 0.0005; // TODO: add effect

    renderer.render(scene, camera);
    composer.render();
    requestAnimationFrame(animate);
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
};

export default MoonScene;
