const Lights: React.FC = () => {
  const lightIntensity = 1;

  return (
    <mesh>
      <ambientLight intensity={7} />
      <directionalLight
        args={["#fff9f0", lightIntensity]}
        position={[0, 20, 0]}
      />
      <directionalLight
        args={["#fff9f0", lightIntensity]}
        position={[0, -20, 0]}
      />
      <directionalLight
        args={["#fff9f0", lightIntensity]}
        position={[20, 0, 35]}
      />
      <directionalLight
        args={["#fff9f0", lightIntensity]}
        position={[-20, 0, -35]}
      />
    </mesh>
  );
};

export default Lights;
