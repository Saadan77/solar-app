import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, SoftShadows } from "@react-three/drei";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

type SolarPanelProps = {
  position: [number, number, number];
};

const SolarPanel: React.FC<SolarPanelProps> = ({ position }) => (
  <mesh position={position} castShadow>
    <boxGeometry args={[1.6, 0.1, 1]} />
    <meshStandardMaterial color="blue" metalness={0.6} roughness={0.3} />
  </mesh>
);

type RoofProps = {
  width: number;
  depth: number;
};

const Roof: React.FC<RoofProps> = ({ width, depth }) => (
  <mesh position={[0, -0.05, 0]} receiveShadow>
    <boxGeometry args={[width, 0.1, depth]} />
    <meshStandardMaterial color="gray" />
  </mesh>
);

const HomeScreen = () => {
  const [roofWidth, setRoofWidth] = useState(10);
  const [roofDepth, setRoofDepth] = useState(10);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);

  // Solar Panel Specs
  const panelWattage = 400;
  const panelEfficiency = 0.20;
  const sunlightHours = 5;

  const panelSize = { width: 1.6, height: 1 };
  const spacing = 0.2;

  // Calculate total solar output
  const totalPanels = rows * cols;
  const totalPower = totalPanels * panelWattage * panelEfficiency * sunlightHours;

  // Adjust panel placement
  const panels = useMemo(
    () =>
      Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => (
          <SolarPanel
            key={`${row}-${col}`}
            position={[
              col * (panelSize.width + spacing) - ((cols - 1) * (panelSize.width + spacing)) / 2,
              0.1,
              row * (panelSize.height + spacing) - ((rows - 1) * (panelSize.height + spacing)) / 2,
            ]}
          />
        ))
      ),
    [rows, cols, roofWidth, roofDepth]
  );

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} shadows camera={{ position: [10, 10, 10], fov: 50 }}>
        <SoftShadows />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={2} castShadow shadow-mapSize={[2048, 2048]} />
        <OrbitControls enableDamping dampingFactor={0.15} />
        <Roof width={roofWidth} depth={roofDepth} />
        {panels}
      </Canvas>

      {/* Left-Side Controls */}
      <View style={styles.controls}>
        <Text style={styles.header}>Roof Size</Text>
        <View style={styles.sliderContainer}>
          <Text>Width: {roofWidth.toFixed(1)}m</Text>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={15}
            step={0.5}
            value={roofWidth}
            onValueChange={setRoofWidth}
          />
        </View>
        <View style={styles.sliderContainer}>
          <Text>Depth: {roofDepth.toFixed(1)}m</Text>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={15}
            step={0.5}
            value={roofDepth}
            onValueChange={setRoofDepth}
          />
        </View>

        <Text style={styles.header}>Solar Panel Grid</Text>
        <View style={styles.sliderContainer}>
          <Text>Rows: {rows}</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={8}
            step={1}
            value={rows}
            onValueChange={setRows}
          />
        </View>
        <View style={styles.sliderContainer}>
          <Text>Columns: {cols}</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={8}
            step={1}
            value={cols}
            onValueChange={setCols}
          />
        </View>

        {/* Solar Output Calculation */}
        <View style={styles.outputContainer}>
          <Text style={styles.outputText}>Total Panels: {totalPanels}</Text>
          <Text style={styles.outputText}>Estimated Power Output: {totalPower.toFixed(2)} kWh/day</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  canvas: { flex: 1 },
  controls: {
    position: "absolute",
    left: 10,
    top: 50,
    width: 160,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  sliderContainer: {
    marginBottom: 10,
  },
  slider: { width: "100%", height: 30 },
  outputContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    alignItems: "center",
  },
  outputText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default HomeScreen;
