import React, { useState, useMemo, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Slider from "@react-native-community/slider";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as THREE from "three";

const { width, height } = Dimensions.get("window");

const GroundPlane = () => {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.05, 0]}
      receiveShadow
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#d3d3d3" roughness={0.8} metalness={0.1} />
    </mesh>
  );
};

const SolarPanel = ({ position, captured }) => {
  const solarTexture = useMemo(
    () =>
      new THREE.TextureLoader().load(
        require("../../assets/models/solar-panel.jpg")
      ),
    []
  );
  const meshRef = useRef<THREE.Mesh>(null);
  const [currentY, setCurrentY] = useState(position[1]);

  useFrame((_, delta) => {
    if (meshRef.current && captured) {
      // Only animate when captured
      const targetY = 0; // Always animate to ground when captured
      const diff = targetY - currentY;
      const newY = currentY + diff * Math.min(delta * 0.5, 1); // Slower animation speed
      setCurrentY(newY);
      meshRef.current.position.y = newY;
    } else if (meshRef.current && !captured) {
      // Instant update when not captured, matching X behavior
      setCurrentY(position[1]);
      meshRef.current.position.y = position[1];
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position as [number, number, number]}
      castShadow
    >
      <boxGeometry args={[1.6, 0.1, 1]} />
      <meshStandardMaterial
        map={solarTexture}
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
  );
};

const HomeScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [rows, setRows] = useState<number>(2);
  const [cols, setCols] = useState<number>(2);
  const [xOffset, setXOffset] = useState<number>(0);
  const [yOffset, setYOffset] = useState<number>(2);
  const [captured, setCaptured] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    (async () => {
      if (!permission) {
        const { status } = await requestPermission();
        setHasPermission(status === "granted");
      } else {
        setHasPermission(permission.granted);
      }
    })();
  }, [permission]);

  const panels = useMemo(() => {
    const result = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * 1.8 - ((cols - 1) * 1.8) / 2 + xOffset;
        const z = row * 1.2 - ((rows - 1) * 1.2) / 2;
        const y = yOffset;

        result.push(
          <SolarPanel
            key={`${row}-${col}`}
            position={[x, y, z] as [number, number, number]}
            captured={captured}
          />
        );
      }
    }
    return result;
  }, [rows, cols, xOffset, yOffset, captured]);

  if (hasPermission === null) return <Text>Requesting permission...</Text>;
  if (hasPermission === false) return <Text>No camera access</Text>;

  return (
    <View style={styles.container}>
      {!captured && <CameraView style={styles.camera} facing="back" />}
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
          shadow-mapSize={[1024, 1024]}
        />
        <OrbitControls enableDamping dampingFactor={0.15} />
        {captured && <GroundPlane />}
        {panels}
      </Canvas>
      {!captured && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCaptured(true)}
        >
          <Text style={styles.buttonText}>Capture</Text>
        </TouchableOpacity>
      )}
      {!captured && (
        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Rows: {rows}</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={8}
              step={1}
              value={rows}
              onValueChange={setRows}
            />
          </View>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Columns: {cols}</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={8}
              step={1}
              value={cols}
              onValueChange={setCols}
            />
          </View>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>
              X Position: {xOffset.toFixed(1)}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={-5}
              maximumValue={5}
              step={0.1}
              value={xOffset}
              onValueChange={setXOffset}
            />
          </View>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>
              Y Position: {yOffset.toFixed(1)}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={5}
              step={0.1}
              value={yOffset}
              onValueChange={setYOffset}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1, width, height, position: "absolute", top: 0, left: 0 },
  canvas: {
    flex: 1,
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
  },
  button: {
    position: "absolute",
    bottom: 200,
    left: width / 2 - 50,
    width: 100,
    height: 50,
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  controls: {
    position: "absolute",
    bottom: 0,
    width: width,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  controlLabel: {
    width: 120,
    fontSize: 14,
  },
  slider: {
    flex: 1,
  },
});

export default HomeScreen;
