import { useLoader, useThree } from "@react-three/fiber";
import React, { Dispatch, SetStateAction, useCallback, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Html, PresentationControls } from "@react-three/drei";
import { Vector3 } from "three";

const Gun: React.FC<{
  setCurrentAttachment: Dispatch<SetStateAction<string | null>>;
}> = ({ setCurrentAttachment }) => {
  const [loading, setLoading] = useState(false);
  const { scene } = useThree();
  const scopeMesh = scene.getObjectByName("scope-attachment");
  const silencerMesh = scene.getObjectByName("silencer-attachment");
  const stockMesh = scene.getObjectByName("stock-attachment");
  const handGuardMesh = scene.getObjectByName("handguard-attachment");

  const renderAttachmentSelectors = useCallback(
    () =>
      ["scopes", "silencers", "stocks", "handGuards"].map((key, index) => {
        let annotations: Vector3 | undefined = undefined;
        if (key === "scopes") {
          annotations = scopeMesh?.position;
        }
        if (key === "silencers") {
          annotations = silencerMesh?.position;
        }
        if (key === "stocks") {
          annotations = stockMesh?.position;
        }
        if (key === "handGuards") {
          annotations = handGuardMesh?.position;
        }
        // if (key === "mags") {
        //   annotations = magMesh?.position;
        // }
        return (
          <Html zIndexRange={[80, 0]} key={index} position={annotations}>
            <div
              onClick={() => {
                setCurrentAttachment((pv) => {
                  if (pv === key) return null;
                  return key;
                });
              }}
              style={{
                width: 20,
                height: 20,
                borderRadius: 100,
                backgroundColor: "red",
              }}
            />
          </Html>
        );
      }),
    [
      scopeMesh?.position,
      silencerMesh?.position,
      stockMesh?.position,
      handGuardMesh?.position,
      setCurrentAttachment,
    ]
  );

  const gltf = useLoader(GLTFLoader, "/newGun.glb", (loader) => {
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
    <PresentationControls
      global
      polar={[-Math.PI / 180, Math.PI / 180]} // Limit polar rotation to 90 degrees
      azimuth={[-Infinity, Infinity]} // No limitation for azimuth rotation
    >
      <mesh receiveShadow castShadow scale={[3, 3, 3]}>
        <primitive object={gltf.scene}>{renderAttachmentSelectors()}</primitive>
      </mesh>
    </PresentationControls>
  );
};

export default Gun;
