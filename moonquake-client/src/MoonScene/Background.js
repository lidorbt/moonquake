import * as THREE from "three";

const backgroundURL =
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/hipp8_s.jpg";

export const getBackground = () => {
  const textureLoader = new THREE.TextureLoader();
  const backgroundTexture = textureLoader.load(backgroundURL);

  const backgroundGeometry = new THREE.SphereGeometry(1000, 60, 60);
  const backgroundMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: backgroundTexture,
    side: THREE.BackSide,
  });
  return { backgroundGeometry, backgroundMaterial };
};
