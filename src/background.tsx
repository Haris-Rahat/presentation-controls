import { useLoader } from "@react-three/fiber";
import React, { useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const Background: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const gltf = useLoader(GLTFLoader, "/simpleBackground.glb", (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.3/"
    );
    loader.setDRACOLoader(dracoLoader);

    loader.manager.onStart = () => {
      console.info("foreground model Loading Start");
      setLoading(true);
    };
    loader.manager.onLoad = () => {
      console.info("foreground model Loading Ended");
      setLoading(false);
    };
    loader.manager.onError = () => {
      console.info("foreground model Loading Error");
      setLoading(false);
    };
  });

  if (loading) return null;

  return (
    <mesh rotation={[0, 0.5, 0]} scale={[3, 3, 3]}>
      <primitive object={gltf.scene} />
    </mesh>
  );
};

export default Background;
