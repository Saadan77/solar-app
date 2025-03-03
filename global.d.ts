import * as THREE from "three";
import { JSX } from "react";

declare module "*.glb" {
  const value: string; // Adjust the type if necessary
  export default value;
}

declare module "*.jpg" {
  const value: string; // Adjust the type if necessary
  export default value;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      boxGeometry: ReactThreeFiber.Object3DNode<
        THREE.BoxGeometry,
        typeof THREE.BoxGeometry
      >;
      meshStandardMaterial: ReactThreeFiber.Object3DNode<
        THREE.MeshStandardMaterial,
        typeof THREE.MeshStandardMaterial
      >;
      ambientLight: ReactThreeFiber.Object3DNode<
        THREE.AmbientLight,
        typeof THREE.AmbientLight
      >;
      directionalLight: ReactThreeFiber.Object3DNode<
        THREE.DirectionalLight,
        typeof THREE.DirectionalLight
      >;
      orbitControls: ReactThreeFiber.Object3DNode<
        THREE.OrbitControls,
        typeof THREE.OrbitControls
      >;
    }
  }
}