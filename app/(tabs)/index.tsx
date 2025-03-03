import React, { useState, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import * as THREE from "three";
import modernHouse from "../../assets/models/modern_house.glb";
import { Asset } from "expo-asset";

const solarTextureUri = Asset.fromModule(require("../../assets/models/solar-panel.jpg")).uri;

type SolarPanelProps = {
  position: [number, number, number];
};

const SolarPanel: React.FC<SolarPanelProps> = ({ position }) => {
  const solarTexture = useTexture(solarTextureUri); // ✅ Pass as URI

  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[1.6, 0.1, 1]} />
      <meshStandardMaterial map={solarTexture} metalness={0.6} roughness={0.3} />
    </mesh>
  );
};

type HouseProps = {
  setRoofHeight: (height: number) => void; // ✅ Accept prop to set roof height
};

const HouseModel: React.FC<HouseProps> = ({ setRoofHeight }) => {
  const { scene } = useGLTF(modernHouse);

  useEffect(() => {
    if (!scene) return;
    const boundingBox = new THREE.Box3().setFromObject(scene);
    setRoofHeight(boundingBox.max.y);
  }, [scene]);

  return <primitive object={scene} position={[0, -0.5, 0]} scale={15} />;
};

const HomeScreen: React.FC = () => {
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(4);
  const [roofHeight, setRoofHeight] = useState<number>(0);
  const [panelHeight, setPanelHeight] = useState<number>(0);

  // Solar Panel Specs
  const panelWattage: number = 400;
  const panelEfficiency: number = 0.2;
  const sunlightHours: number = 5;

  const panelSize = { width: 1.6, height: 1 };
  const spacing: number = 0.2;

  // Calculate total solar output
  const totalPanels: number = rows * cols;
  const totalPower: number =
    totalPanels * panelWattage * panelEfficiency * sunlightHours;

  // Adjust panel placement dynamically
  const panels = useMemo(
    () =>
      Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => (
          <SolarPanel
            key={`${row}-${col}`}
            position={[
              col * (panelSize.width + spacing) -
                ((cols - 1) * (panelSize.width + spacing)) / 2,
              roofHeight + panelHeight, // ✅ Now properly updates via slider
              row * (panelSize.height + spacing) -
                ((rows - 1) * (panelSize.height + spacing)) / 2,
            ]}
          />
        ))
      ),
    [rows, cols, roofHeight, panelHeight]
  );

  return (
    <View style={styles.container}>
      <Canvas
        style={styles.canvas}
        shadows
        camera={{ position: [10, 10, 10], fov: 50 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <OrbitControls enableDamping dampingFactor={0.15} />
        <HouseModel setRoofHeight={setRoofHeight} />
        {panels}
      </Canvas>

      <View style={styles.controls}>
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
        <View style={styles.sliderContainer}>
          <Text>Panel Height: {panelHeight.toFixed(1)}m</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={2}
            step={0.1}
            value={panelHeight}
            onValueChange={setPanelHeight} // ✅ Updates dynamically
          />
        </View>

        <View style={styles.outputContainer}>
          <Text style={styles.outputText}>Total Panels: {totalPanels}</Text>
          <Text style={styles.outputText}>
            Estimated Power Output: {totalPower.toFixed(2)} kWh/day
          </Text>
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
