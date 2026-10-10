import { memo, Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
} from "@react-three/drei";
import { PostAO } from "./PostAO";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { PCFShadowMap, PerspectiveCamera, Vector3 } from "three";
import { Character } from "./Character";
import type { CharacterAsset } from "../assets/catalog";
import { paperwood, woodenCompanion } from "../assets/demo";
import type { WorldPackage, CharacterPackage } from "../assets/packages";
import type { ObjectId } from "../worlds/studio";
import type { Activity } from "../runtime/semantic";
import { createNavigation } from "../runtime/navigation";
import { props as homeFurniture, homeScale } from "../worlds/xiyue";

function Camera({
  reset,
  zoom,
  focus,
  large,
  focusTarget,
}: {
  reset: number;
  zoom: number;
  focus: boolean;
  large: boolean;
  focusTarget?: [number, number, number];
}) {
  const { camera, size, invalidate } = useThree();
  const controls = useRef<OrbitControlsImpl>(null!);
  useEffect(() => {
    camera.position.set(
      ...((focus
        ? focusTarget
          ? [focusTarget[0] + 4, 6, focusTarget[2] + 5]
          : [-6, 6, 3]
        : large
          ? [-7, 22, 17]
          : [10, 9, 12]) as [number, number, number]),
    );
    controls.current?.target.set(
      ...((focus
        ? (focusTarget ?? [-2.3, 0.8, -1.6])
        : large
          ? [0, 0.6, 0]
          : [0, 0.9, 0]) as [number, number, number]),
    );
    controls.current?.update();
  }, [reset, camera, focus, large, focusTarget]);
  useEffect(() => {
    if ("zoom" in camera) {
      camera.zoom =
        Math.min(
          size.width / (large ? 15 : 14.2),
          size.height / (large ? 11.6 : 11),
        ) *
        zoom *
        (focus ? 2 : 1);
      camera.updateProjectionMatrix();
      invalidate();
    }
  }, [camera, size, zoom, reset, invalidate, focus, large]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={[0, 0.9, 0]}
      minPolarAngle={large ? 0.02 : 0.45}
      maxPolarAngle={1.25}
      minAzimuthAngle={large ? -1.35 : -0.22}
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
/**
 * Xiyue uses a Sims-style perspective rig: free 360° orbit (walls cut away by
 * facing), low angles allowed so the lake and hills read as a real backdrop.
 */
const homeTarget = new Vector3(0.2, 0.3, 0.3);
const homeDirection = new Vector3(-0.55, 0.78, 0.85).normalize();
function PerspectiveRig({
  reset,
  zoom,
  focus,
  focusTarget,
}: {
  reset: number;
  zoom: number;
  focus: boolean;
  focusTarget?: [number, number, number];
}) {
  const { camera, size } = useThree();
  const controls = useRef<OrbitControlsImpl>(null!);
  const fitDistance = () => {
    const cam = camera as PerspectiveCamera;
    const v = (cam.fov * Math.PI) / 180 / 2;
    const h = Math.atan(Math.tan(v) * (size.width / size.height));
    return Math.max(8.4 / Math.tan(h), 6.2 / Math.tan(v));
  };
  useEffect(() => {
    const target = focus
      ? new Vector3(...(focusTarget ?? [-2.2, 0.8, -1.5]))
      : homeTarget.clone();
    const distance = focus ? 6.5 : fitDistance() / zoom;
    camera.position.copy(target).addScaledVector(homeDirection, distance);
    controls.current?.target.copy(target);
    controls.current?.update();
    // Zoom is applied separately so it keeps the current orbit angle.
  }, [reset, camera, focus, focusTarget, size.width, size.height]);
  useEffect(() => {
    const c = controls.current;
    if (!c || focus) return;
    const offset = camera.position.clone().sub(c.target);
    camera.position
      .copy(c.target)
      .addScaledVector(offset.normalize(), fitDistance() / zoom);
    c.update();
  }, [zoom]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      minPolarAngle={0.12}
      maxPolarAngle={1.38}
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.5}
      zoomSpeed={0.7}
      minDistance={3.5}
      maxDistance={48}
    />
  );
}

export interface SceneProps {
  importedLayer?: import("react").ReactNode;
  focusTarget?: [number, number, number];
  focus?: boolean;
  layout?: import("../worlds/xiyue").Layout;
  onWardrobe?: () => void;
  targetAnchor?: import("../worlds/studio").Anchor;
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
  const isHome = world.id === "xiyue-home-v1";
  const floorLamp = homeFurniture.find((p) => p.id === "living-lamp")!;
  const navigation = useMemo(
    () =>
      createNavigation({
        ...world.bounds,
        obstacles: world.obstacles,
        clearance: 0.2,
        cellSize: world.navigationCellSize,
      }),
    [world],
  );
  const look = isHome
    ? props.night
      ? {
          background: "#3d4655",
          ambient: 0.1,
          ambientColor: "#8fa3c8",
          hemisphere: ["#5d6f93", "#1d2620", 0.32] as const,
          sun: 0.7,
          sunColor: "#a9bddf",
        }
      : {
          background: "#f1e3c6",
          ambient: 0.16,
          ambientColor: "#fff5df",
          hemisphere: ["#ffe6bd", "#6f7a52", 0.3] as const,
          sun: 3.9,
          sunColor: "#ffcf8f",
        }
    : {
        background: props.night ? "#c6cec8" : "#eeece5",
        ambient: props.night ? 0.75 : 1.1,
        ambientColor: props.night ? "#abbcd2" : "#fff5df",
        hemisphere: ["#fff4d6", "#9b9e85", props.night ? 0.8 : 1.15] as const,
        sun: props.night ? 1 : 2.5,
        sunColor: props.night ? "#f4d8a0" : "#fff0d0",
      };
  return (
    <Canvas
      key={world.id}
      orthographic={!isHome}
      shadows={isHome ? "soft" : "percentage"}
      frameloop={props.paused ? "demand" : "always"}
      dpr={[1, 1.5]}
      camera={
        isHome
          ? { position: [-10, 16, 15], fov: 34, near: 0.1, far: 500 }
          : { position: [10, 9, 12], zoom: 60, near: 0.1, far: 80 }
      }
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = PCFShadowMap;
      }}
    >
      <color attach="background" args={[look.background]} />
      {isHome && <fog attach="fog" args={[look.background, 38, 150]} />}
      <ambientLight intensity={look.ambient} color={look.ambientColor} />
      <hemisphereLight args={look.hemisphere} />
      {/* Xiyue: low golden sun by day, cool moonlight by night; interior lamps carry the evening. */}
      <directionalLight
        position={isHome ? [-11, 13, -13] : [-3, 8, 4]}
        intensity={look.sun}
        color={look.sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={isHome ? -13 : -8}
        shadow-camera-right={isHome ? 13 : 8}
        shadow-camera-top={isHome ? 13 : 8}
        shadow-camera-bottom={isHome ? -13 : -8}
        shadow-camera-far={isHome ? 60 : 50}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
      />
      <pointLight
        position={
          isHome
            ? [floorLamp.x * homeScale, 1.65, floorLamp.z * homeScale]
            : [-3.5, 1.9, 2.35]
        }
        intensity={props.night ? 13 : 1}
        color="#ffd18a"
        distance={7}
        decay={2}
      />
      <pointLight
        position={
          isHome
            ? [-4.55 * homeScale, 1.03, -2.7 * homeScale]
            : [3.13, 1.75, -2.7]
        }
        intensity={props.night ? 5 : 0.4}
        color="#ffd58c"
        distance={4}
      />
      {isHome && props.night && (
        <>
          <pointLight
            position={[4.6 * homeScale, 1.3, 0.05 * homeScale]}
            intensity={5}
            color="#ffd28a"
            distance={4}
          />
          <pointLight
            position={[1.4 * homeScale, 2.3, 2.7 * homeScale]}
            intensity={7}
            color="#ffdca0"
            distance={5}
          />
        </>
      )}
      {isHome && (
        // Procedural image-based light: sky, sun-side bounce and grass bounce. No HDR download.
        <Environment
          resolution={128}
          frames={1}
          environmentIntensity={props.night ? 0.08 : 0.5}
        >
          <Lightformer
            form="rect"
            intensity={1.4}
            color="#eaf0f2"
            position={[0, 10, 0]}
            rotation-x={Math.PI / 2}
            scale={[30, 30, 1]}
          />
          <Lightformer
            form="rect"
            intensity={2.2}
            color="#ffd9a6"
            position={[-12, 6, -12]}
            rotation-y={Math.PI / 4}
            scale={[14, 6, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.6}
            color="#9fb07a"
            position={[0, -4, 0]}
            rotation-x={-Math.PI / 2}
            scale={[40, 40, 1]}
          />
        </Environment>
      )}
      {isHome && <PostAO />}
      <Suspense fallback={null}>
        <Surface
          fixedShell={worldPackage.fixedShell}
          layout={props.layout}
          onWardrobe={props.onWardrobe}
          night={props.night}
          autumn={props.autumn}
          onSelect={props.onSelect}
          showLabels={props.showLabels}
        />
        {props.importedLayer}
        <Character
          key={world.id}
          targetAnchor={props.targetAnchor}
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
        {!isHome && (
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
        )}
      </Suspense>
      {isHome ? (
        <PerspectiveRig
          reset={props.reset}
          zoom={props.zoom}
          focus={!!props.focus}
          focusTarget={props.focusTarget}
        />
      ) : (
        <Camera
          reset={props.reset}
          zoom={props.zoom}
          focus={!!props.focus}
          focusTarget={props.focusTarget}
          large={false}
        />
      )}
    </Canvas>
  );
}
export default memo(HabitatScene);
