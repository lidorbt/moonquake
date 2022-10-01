import * as THREE from "three";

export const getHemisphereLight = () => {
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);

  hemisphereLight.color.setHSL(0.6, 1, 0.6);
  hemisphereLight.groundColor.setHSL(0.095, 1, 0.75);
  hemisphereLight.position.set(0, 0, 0);

  return hemisphereLight;
};
