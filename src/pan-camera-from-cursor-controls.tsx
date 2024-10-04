import * as THREE from "three";
import { useRef, useEffect, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";

const PanCameraFromCursorControls: React.FC<{ isMobile: boolean }> = ({
  isMobile,
}) => {
  const camera = useThree(({ camera }) => camera);
  const isActive_ref = useRef(false);
  const isMouseActive_ref = useRef(true); // determines if the mouse position controls the camera

  const startPosVec_ref = useRef(camera.position.clone());
  const targetPosVec_ref = useRef(startPosVec_ref.current.clone());
  const lookAtPos_ref = useRef(new THREE.Vector3(...[0, 0, 0]));
  const defaultSpeed = 0.42;
  const speed_ref = useRef(defaultSpeed);
  const variance_x = 0.3;
  const variance_y = 0.3;
  const lowerBoundPos_x = useMemo(() => {
    return startPosVec_ref.current.x - variance_x / 2;
  }, []);
  const lowerBoundPos_y = useMemo(() => {
    return startPosVec_ref.current.y - variance_y / 2;
  }, []);

  // reset camera position when tab is reactivated (fixes camera flying off for unkown reason)
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      resetTargetPosition();
      camera.position.copy(startPosVec_ref.current);
    }
  }, [camera.position]);

  const updateTargetPosition = useCallback(
    (event: MouseEvent) => {
      if (!isMouseActive_ref.current) return;

      const normalizedMousePos_x = 1 - event.offsetX / window.innerWidth;
      const normalizedMousePos_y = 1 - event.offsetY / window.innerHeight;

      if (
        Number.isNaN(normalizedMousePos_x) ||
        Number.isNaN(normalizedMousePos_y)
      )
        return;

      // set the new target position
      targetPosVec_ref.current.set(
        lowerBoundPos_x + variance_x * normalizedMousePos_x,
        lowerBoundPos_y + variance_y * normalizedMousePos_y,
        camera.position.z
      );
    },
    [camera.position.z, lowerBoundPos_x, lowerBoundPos_y]
  );

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("SceneIsBeingRevealed", () => {
      isActive_ref.current = true;
    });
    document.addEventListener(
      "executeIntroAnimation",
      handleExecuteIntroAnimation
    );
    if (!isMobile) {
      document.addEventListener("mousemove", updateTargetPosition);
      document.addEventListener("mouseleave", resetTargetPosition);
    }
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener(
        "executeIntroAnimation",
        handleExecuteIntroAnimation
      );
      if (!isMobile) {
        document.removeEventListener("mousemove", updateTargetPosition);
        document.removeEventListener("mouseleave", resetTargetPosition);
      }
    };
  }, [handleVisibilityChange, isMobile, updateTargetPosition]);

  function handleExecuteIntroAnimation(e) {
    isMouseActive_ref.current = false; // disable mouse controls
    speed_ref.current = 1;
    setTimeout(() => {
      speed_ref.current = defaultSpeed;
      isMouseActive_ref.current = true;
    }, e.detail.duration);
  }

  useFrame((_state, delta) => {
    // Delta values increases if the window is inactive because difference in current & previous frames are too large
    if (
      camera.position.distanceTo(targetPosVec_ref.current) > 0.01 &&
      delta < 0.1
    ) {
      camera.position.lerp(targetPosVec_ref.current, speed_ref.current * delta);
    }
    // must be called after lerp or jerkyness insues
    camera.lookAt(lookAtPos_ref.current);
  });

  function resetTargetPosition() {
    targetPosVec_ref.current.copy(startPosVec_ref.current);
  }

  return null;
};

export default PanCameraFromCursorControls;
