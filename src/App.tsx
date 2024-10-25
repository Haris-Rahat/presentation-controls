import { ContactShadows, PerspectiveCamera, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import * as THREE from "three";
import Gun from "./gun";
import Background from "./background";
import CustomCameraControls from "./custom-camera-controls";
import Lights from "./lights";

function App() {
  const [currentAttachment, setCurrentAttachment] = useState<string | null>(
    null,
  );
  return (
    <div className={"wrapper"}>
      <Canvas
        id={"scene"}
        camera={{ fov: 75 }}
        gl={{
          alpha: true,
          toneMapping: THREE.LinearToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: "high-performance",
          antialias: true,
          preserveDrawingBuffer: true,
        }}
      >
        <Stats showPanel={0} />
        <Suspense>
          <Background />
        </Suspense>
        <PerspectiveCamera
          makeDefault
          fov={10}
          aspect={window.innerWidth / window.innerHeight}
          position={[0, 0, 80]}
        />
        <CustomCameraControls currentAttachment={currentAttachment} />
        <Suspense>
          <Gun setCurrentAttachment={setCurrentAttachment} />
        </Suspense>
        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.75}
          scale={10}
          blur={3}
          far={4}
        />
        <Lights />
      </Canvas>
    </div>
  );
}

export default App;
