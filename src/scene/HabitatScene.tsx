import { memo, Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Color, PCFShadowMap } from "three";
import { Character } from "./Character";
import type { CharacterAsset } from "../assets/catalog";
import { paperwood, woodenCompanion } from "../assets/demo";
import type { WorldPackage, CharacterPackage } from "../assets/packages";
import type { ObjectId } from "../worlds/studio";
import type { Activity } from "../runtime/semantic";
import { createNavigation } from "../runtime/navigation";

function Camera({ reset, zoom }: { reset: number; zoom: number }) {
  const { camera, size, invalidate } = useThree();
  const controls = useRef<OrbitControlsImpl>(null!);
  useEffect(() => {
    camera.position.set(10, 9, 12);
    controls.current?.target.set(0, 0.9, 0);
    controls.current?.update();
  }, [reset, camera]);
  useEffect(() => {
    if ("zoom" in camera) {
      camera.zoom = Math.min(size.width / 14.2, size.height / 11) * zoom;
      camera.updateProjectionMatrix();
      invalidate();
    }
  }, [camera, size, zoom, reset, invalidate]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={[0, 0.9, 0]}
      minPolarAngle={0.45}
      maxPolarAngle={1.25}
      minAzimuthAngle={-0.22}
      maxAzimuthAngle={1.5}
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.5}
      zoomSpeed={0.7}
      minZoom={25}
      maxZoom={130}
    />
  );
}
export interface SceneProps {
  night: boolean;
  autumn: boolean;
  paused: boolean;
  reduced: boolean;
  activity: Activity;
  asset: CharacterAsset;
  speech: string | null;
  showLabels: boolean;
  onSelect: (id: ObjectId) => void;
  onMotion: (moving: boolean, blocked: boolean) => void;
  reset: number;
  zoom: number;
  worldPackage?: WorldPackage;
  characterPackage?: CharacterPackage;
}
function HabitatScene(props: SceneProps) {
  const worldPackage = props.worldPackage ?? paperwood;
  const { definition: world, Surface } = worldPackage;
  const navigation = useMemo(
    () =>
      createNavigation({
        ...world.bounds,
        obstacles: world.obstacles,
        clearance: 0.2,
      }),
    [world],
  );
  return (
    <Canvas
      orthographic
      shadows="percentage"
      frameloop={props.paused ? "demand" : "always"}
      dpr={[1, 1.5]}
      camera={{ position: [10, 9, 12], zoom: 60, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl, scene }) => {
        gl.shadowMap.type = PCFShadowMap;
        scene.background = new Color(props.night ? "#d2d7d1" : "#eeece5");
      }}
    >
      <color attach="background" args={[props.night ? "#c6cec8" : "#eeece5"]} />
      <ambientLight
        intensity={props.night ? 0.75 : 1.1}
        color={props.night ? "#abbcd2" : "#fff5df"}
      />
      <hemisphereLight
        args={["#fff4d6", "#9b9e85", props.night ? 0.8 : 1.15]}
      />
      <directionalLight
        position={[-3, 8, 4]}
        intensity={props.night ? 1 : 2.5}
        color={props.night ? "#f4d8a0" : "#fff0d0"}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
      />
      <pointLight
        position={[-3.5, 1.9, 2.35]}
        intensity={props.night ? 13 : 1}
        color="#ffd18a"
        distance={7}
        decay={2}
      />
      <pointLight
        position={[3.13, 1.75, -2.7]}
        intensity={props.night ? 5 : 0.4}
        color="#ffd58c"
        distance={4}
      />
      <Suspense fallback={null}>
        <Surface
          night={props.night}
          autumn={props.autumn}
          onSelect={props.onSelect}
          showLabels={props.showLabels}
        />
        <Character
          key={world.id}
          asset={props.asset}
          characterPackage={props.characterPackage ?? woodenCompanion}
          world={world}
          navigation={navigation}
          activity={props.activity}
          paused={props.paused}
          reduced={props.reduced}
          speech={props.speech}
          onMotion={props.onMotion}
        />
        <ContactShadows
          position={[0, -0.61, 0]}
          scale={18}
          opacity={0.26}
          blur={2.5}
          far={9}
          resolution={512}
          frames={1}
          color="#605344"
        />
      </Suspense>
      <Camera reset={props.reset} zoom={props.zoom} />
    </Canvas>
  );
}
export default memo(HabitatScene);
