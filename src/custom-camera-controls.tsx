import { CameraControls, useProgress } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";

const paddingInsets = [10, 700, 10, 10];

const CustomCameraControls: React.FC<{
  currentAttachment: string | null;
}> = ({ currentAttachment }) => {
  const cameraRef = useRef<CameraControls>(null);
  const { scene, gl } = useThree();
  const { loaded } = useProgress();

  const paddingInCssPixel = useCallback(
    async (
      paddingInsets: Array<number>,
      mesh: THREE.Mesh,
      gl: THREE.WebGLRenderer
    ) => {
      if (!cameraRef.current) return;
      const [top, right, bottom, left] = paddingInsets;
      const fov =
        (cameraRef.current.camera as THREE.PerspectiveCamera)?.fov *
        THREE.MathUtils.DEG2RAD;
      const rendererHeight = gl.getSize(new THREE.Vector2()).height;
      const boundingBox = new THREE.Box3().setFromObject(mesh);
      const size = boundingBox.getSize(new THREE.Vector3());
      const boundingWidth = size.x;
      const boundingHeight = size.y;
      const boundingDepth = size.z;

      let distanceToFit = cameraRef.current.getDistanceToFitBox(
        boundingWidth,
        boundingHeight,
        boundingDepth
      );
      let paddingTop = 0;
      let paddingBottom = 0;
      let paddingLeft = 0;
      let paddingRight = 0;

      // loop to find almost convergence points
      for (let i = 0; i < 10; i++) {
        const depthAt = distanceToFit - boundingDepth * 0.5;
        const cssPixelToUnit =
          (2 * Math.tan(fov * 0.5) * Math.abs(depthAt)) / rendererHeight;
        paddingTop = top * cssPixelToUnit;
        paddingBottom = bottom * cssPixelToUnit;
        paddingLeft = left * cssPixelToUnit;
        paddingRight = right * cssPixelToUnit;

        distanceToFit = cameraRef.current.getDistanceToFitBox(
          boundingWidth + paddingLeft + paddingRight,
          boundingHeight + paddingTop + paddingBottom,
          boundingDepth
        );
      }

      await Promise.all([
        cameraRef.current.fitToBox(mesh, true, {
          paddingLeft: paddingLeft,
          paddingRight: paddingRight,
          paddingBottom: paddingBottom,
          paddingTop: paddingTop,
        }),
      ]);
    },
    []
  );

  const handleResize = useCallback(() => {
    const id = setTimeout(async () => {
      if (cameraRef.current && loaded) {
        if (!currentAttachment) {
          const gunPositionMesh = scene.getObjectByName(
            "gunposition-cube"
          ) as THREE.Mesh;
          const gunPositionBox =
            gunPositionMesh && new THREE.Box3().setFromObject(gunPositionMesh);
          cameraRef.current.fitToBox(gunPositionBox, true, {
            paddingTop: 1,
            paddingBottom: 2,
            paddingLeft: 5,
            paddingRight: 5,
            cover: true,
          });
          cameraRef.current.rotatePolarTo(85 * THREE.MathUtils.DEG2RAD, true);
        } else {
          if (currentAttachment === "scopes") {
            const scopeMesh = scene.getObjectByName("scopes-cube");
            if (scopeMesh) {
              await paddingInCssPixel(
                paddingInsets,
                scopeMesh as THREE.Mesh,
                gl
              );
            }
          } else if (currentAttachment === "silencers") {
            const silencerMesh = scene.getObjectByName("silencers-cube");
            if (silencerMesh) {
              await paddingInCssPixel(
                paddingInsets,
                silencerMesh as THREE.Mesh,
                gl
              );
            }
          } else if (currentAttachment === "stocks") {
            const stockMesh = scene.getObjectByName("stocks-cube");
            if (stockMesh) {
              await paddingInCssPixel(
                paddingInsets,
                stockMesh as THREE.Mesh,
                gl
              );
            }
          } else if (currentAttachment === "handGuards") {
            const handGuardsMesh = scene.getObjectByName("handguards-cube");
            if (handGuardsMesh) {
              await paddingInCssPixel(
                paddingInsets,
                handGuardsMesh as THREE.Mesh,
                gl
              );
            }
          }
        }
      }
    }, 500);
    return () => clearTimeout(id);
  }, [loaded, currentAttachment, scene, paddingInCssPixel, gl]);

  useEffect(() => {
    handleResize();
  }, [handleResize]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return (
    <CameraControls
      ref={cameraRef}
      mouseButtons={{
        left: 0,
        right: 0,
        wheel: 0,
        middle: 0,
      }}
    />
  );
};

export default CustomCameraControls;
