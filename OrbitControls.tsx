import React, { useEffect, useRef } from "react";
import { extend, useThree } from "@react-three/fiber";
import { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls";
import { ReactThreeFiber } from "@react-three/fiber";

extend({ OrbitControls: OrbitControlsImpl });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<
        OrbitControlsImpl,
        typeof OrbitControlsImpl
      >;
    }
  }
}

const OrbitControls = (props: any) => {
  const { camera, gl } = useThree();
  const ref = useRef<OrbitControlsImpl>();

  useEffect(() => {
    if (ref.current) {
      ref.current.object = camera;
      ref.current.update();
    }
  }, [camera]);

  return <orbitControls ref={ref} args={[camera, gl.domElement]} {...props} />;
};

export default OrbitControls;