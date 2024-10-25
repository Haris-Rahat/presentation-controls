import * as THREE from "three";
import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";

export default function PanCameraFromCursorControls({ isMobile }) {
  const camera = useThree(({ camera }) => camera);
  console.log("camera ", camera.position);
  const sceneEl = useMemo(() => {
    return document.getElementById("scene");
  }, []);
  const isActive_ref = useRef(false);
  const isMouseActive_ref = useRef(true); // determines if the mouse position controls the camera

  const startPosVec_ref = useRef(camera.position.clone());
  const targetPosVec_ref = useRef(startPosVec_ref.current.clone());
  const lookAtPos_ref = useRef(camera.position.clone());
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
      sceneEl.addEventListener("mousemove", updateTargetPosition);
      sceneEl.addEventListener("mouseleave", resetTargetPosition);
    }
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener(
        "executeIntroAnimation",
        handleExecuteIntroAnimation
      );
      if (!isMobile) {
        sceneEl.removeEventListener("mousemove", updateTargetPosition);
        sceneEl.removeEventListener("mouseleave", resetTargetPosition);
      }
    };
  }, []);

  function handleExecuteIntroAnimation(e) {
    isMouseActive_ref.current = false; // disable mouse controls
    speed_ref.current = 1;
    setTimeout(() => {
      speed_ref.current = defaultSpeed;
      isMouseActive_ref.current = true;
    }, e.detail.duration);
  }

  // reset camera position when tab is reactivated (fixes camera flying off for unkown reason)
  function handleVisibilityChange(e) {
    if (document.visibilityState === "visible") {
      resetTargetPosition();
      camera.position.copy(startPosVec_ref.current);
    }
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

  function updateTargetPosition(event) {
    if (!isMouseActive_ref.current) return;

    let normalizedMousePos_x = 1 - event.offsetX / sceneEl.clientWidth;
    let normalizedMousePos_y = 1 - event.offsetY / sceneEl.clientHeight;

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
  }

  function resetTargetPosition() {
    targetPosVec_ref.current.copy(startPosVec_ref.current);
  }

  return null;
}
