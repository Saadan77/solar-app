import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { View, Text, Slider, StyleSheet } from "react-native";

const SolarPanel = ({ position }) => (
  <mesh position={position}>
    <boxGeometry args={[1.6, 0.1, 1]} />
    <meshStandardMaterial color="blue" />
  </mesh>
);

const Roof = () => (
  <mesh position={[0, -0.05, 0]}>
    <boxGeometry args={[10, 0.1, 10]} />
    <meshStandardMaterial color="gray" />
  </mesh>
);

const SolarPanelSimulation = () => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const spacing = 0.2;

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} camera={{ position: [5, 5, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <OrbitControls />
        <Roof />
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((_, col) => (
            <SolarPanel
              key={`${row}-${col}`}
              position={[
                col * (1.6 + spacing) - (cols * (1.6 + spacing)) / 2,
                0.1,
                row * (1 + spacing) - (rows * (1 + spacing)) / 2,
              ]}
            />
          ))
        )}
      </Canvas>
      <View style={styles.controls}>
        <Text>Rows: {rows}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={rows}
          onValueChange={setRows}
        />
        <Text>Columns: {cols}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={cols}
          onValueChange={setCols}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  canvas: { flex: 1 },
  controls: { padding: 10 },
  slider: { width: "100%", height: 40 },
});

export default SolarPanelSimulation;
