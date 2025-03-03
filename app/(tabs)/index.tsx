import React, { useState, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import Slider from "@react-native-community/slider";
import { Asset } from "expo-asset";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as THREE from "three";

const { width, height } = Dimensions.get("window");

const SolarPanel: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  const solarTextureUri =
    Platform.OS === "web"
      ? require("../../assets/models/solar-panel.jpg")
      : Asset.fromModule(require("../../assets/models/solar-panel.jpg")).uri;

  const textureLoader = new THREE.TextureLoader();
  const solarTexture = useMemo(() => textureLoader.load(solarTextureUri), [solarTextureUri]);

  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[1.6, 0.1, 1]} />
      <meshStandardMaterial
        map={solarTexture}
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
  );
};

const HomeScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(4);
  const [panelHeight, setPanelHeight] = useState<number>(0.2);

  const [permission, requestPermission] = useCameraPermissions();

  const panelWattage = 400;
  const panelEfficiency = 0.2;
  const sunlightHours = 5;
  const panelSize = { width: 1.6, height: 1 };
  const spacing = 0.2;

  useEffect(() => {
    (async () => {
      if (!permission) {
        const { status } = await requestPermission();
        setHasPermission(status === "granted");
      } else {
        setHasPermission(permission.granted);
      }
    })();
  }, [permission, requestPermission]);

  const totalPanels = rows * cols;
  const totalPower = totalPanels * panelWattage * panelEfficiency * sunlightHours;

  const panels = useMemo(() => {
    const result = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        result.push(
          <SolarPanel
            key={`${row}-${col}`}
            position={[
              col * (panelSize.width + spacing) - ((cols - 1) * (panelSize.width + spacing)) / 2,
              panelHeight,
              row * (panelSize.height + spacing) - ((rows - 1) * (panelSize.height + spacing)) / 2,
            ]}
          />
        );
      }
    }
    return result;
  }, [rows, cols, panelHeight]);

  if (hasPermission === null) return <Text>Requesting permission...</Text>;
  if (hasPermission === false) return <Text>No camera access</Text>;

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" />
      <Canvas
        style={styles.canvas}
        shadows
        camera={{ position: [0, 5, 10], fov: 50 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <OrbitControls enableDamping dampingFactor={0.15} />
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
            onValueChange={setPanelHeight}
          />
        </View>
        <View style={styles.outputContainer}>
          <Text style={styles.outputText}>Total Panels: {totalPanels}</Text>
          <Text style={styles.outputText}>
            Estimated Power: {totalPower.toFixed(2)} kWh/day
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: {
    flex: 1,
    width,
    height,
    position: "absolute",
    top: 0,
    left: 0,
  },
  canvas: {
    flex: 1,
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
  },
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
  sliderContainer: { marginBottom: 10 },
  slider: { width: "100%", height: 30 },
  outputContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    alignItems: "center",
  },
  outputText: { fontSize: 14, fontWeight: "bold" },
});

export default HomeScreen;