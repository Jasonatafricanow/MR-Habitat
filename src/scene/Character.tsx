import { useEffect, useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import type { Activity } from "../runtime/semantic";
import { createAnimator } from "./characterRig";
import { Box, Sphere, Cylinder, Book } from "./Primitives";
import type { WorldDefinition } from "../worlds/studio";
import type { createNavigation } from "../runtime/navigation";
import { createMotion } from "../runtime/motion";
import type { CharacterAsset } from "../assets/catalog";
import type { CharacterPackage } from "../assets/packages";

export function Toy({
  asset,
  reading,
}: {
  asset: CharacterAsset;
  reading: boolean;
}) {
  return (
    <group name="Torso" position={[0, 0.85, 0]}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <capsuleGeometry args={[0.21, 0.25, 5, 14]} />
        <meshStandardMaterial color={asset.coat} roughness={0.95} />
      </mesh>
      <Box
        position={[0, 0.2, 0.184]}
        size={[0.12, 0.25, 0.035]}
        color="#e4d8b9"
        radius={0.02}
      />
      <Box
        position={[0.105, 0.03, 0.19]}
        size={[0.095, 0.075, 0.024]}
        color={asset.coat}
      />
      <group name="Head" position={[0, 0.52, 0]}>
        <Sphere scale={[0.285, 0.31, 0.265]} color={asset.skin} />
        <Sphere
          position={[0, 0.135, -0.047]}
          scale={[0.306, 0.242, 0.28]}
          color={asset.hair}
        />
        <Sphere
          position={[-0.22, -0.005, -0.035]}
          scale={[0.096, 0.2, 0.18]}
          color={asset.hair}
        />
        <Sphere
          position={[0.22, -0.005, -0.035]}
          scale={[0.096, 0.2, 0.18]}
          color={asset.hair}
        />
        <Sphere
          position={[0.083, 0.16, 0.2]}
          scale={[0.19, 0.1, 0.08]}
          color={asset.hair}
        />
        <Sphere
          position={[-0.15, 0.155, 0.19]}
          scale={[0.11, 0.105, 0.085]}
          color={asset.hair}
        />
        {[-0.1, 0.1].map((x) => (
          <Sphere
            key={x}
            position={[x, -0.014, 0.245]}
            scale={[0.024, 0.033, 0.018]}
            color="#3f3930"
          />
        ))}
        {[-0.175, 0.175].map((x) => (
          <Sphere
            key={x}
            position={[x, -0.075, 0.213]}
            scale={[0.042, 0.023, 0.017]}
            color="#cf9d85"
          />
        ))}
        <Sphere
          position={[0, -0.057, 0.267]}
          scale={[0.032, 0.03, 0.027]}
          color={asset.skin}
        />
        <Box
          position={[0, -0.117, 0.239]}
          size={[0.044, 0.011, 0.014]}
          color="#a97861"
          radius={0.004}
        />
        <Cylinder
          position={[0, 0.345, -0.01]}
          radius={0.31}
          top={0.25}
          height={0.15}
          color="#859777"
        />
        <Cylinder
          position={[0, 0.279, 0.025]}
          radius={0.37}
          height={0.045}
          color="#93a480"
        />
        <Box
          position={[0.16, 0.355, 0.22]}
          size={[0.075, 0.08, 0.015]}
          color="#d3c18c"
          rotation={[0, 0.4, 0.3]}
        />
      </group>
      {[-1, 1].map((sign, i) => (
        <group
          key={sign}
          name={i ? "ArmR" : "ArmL"}
          position={[sign * 0.255, 0.28, 0]}
          rotation={[0, 0, sign * 0.1]}
        >
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.075, 0.2, 4, 12]} />
            <meshStandardMaterial color={asset.coat} />
          </mesh>
          <Sphere
            position={[0, -0.34, 0]}
            scale={[0.074, 0.085, 0.074]}
            color={asset.skin}
          />
        </group>
      ))}
      {[-1, 1].map((sign, i) => (
        <group
          key={sign}
          name={i ? "LegR" : "LegL"}
          position={[sign * 0.112, -0.15, 0]}
        >
          <Box
            position={[0, -0.16, 0]}
            size={[0.16, 0.32, 0.17]}
            color="#515d50"
            radius={0.06}
          />
          <group name={i ? "ShinR" : "ShinL"} position={[0, -0.3, 0]}>
            <Box
              position={[0, -0.145, 0]}
              size={[0.145, 0.3, 0.155]}
              color="#515d50"
              radius={0.05}
            />
            <Box
              position={[0, -0.26, 0.055]}
              size={[0.18, 0.13, 0.28]}
              color="#66503c"
              radius={0.04}
            />
            <Box
              position={[0, -0.32, 0.055]}
              size={[0.185, 0.035, 0.29]}
              color="#d1be9d"
              radius={0.01}
            />
          </group>
        </group>
      ))}
      <group visible={reading}>
        <Book
          position={[0, 0.1, 0.38]}
          rotation={[0.6, 0, 0]}
          color="#718478"
          size={[0.43, 0.055, 0.29]}
        />
      </group>
    </group>
  );
}

export function Character({
  asset,
  characterPackage,
  world,
  navigation,
  activity,
  paused,
  reduced,
  speech,
  onMotion,
}: {
  asset: CharacterAsset;
  characterPackage: CharacterPackage;
  world: WorldDefinition;
  navigation: ReturnType<typeof createNavigation>;
  activity: Activity;
  paused: boolean;
  reduced: boolean;
  speech: string | null;
  onMotion: (moving: boolean, blocked: boolean) => void;
}) {
  const root = useRef<Group>(null!);
  const rig = useRef<Group>(null!);
  const animator = useRef<ReturnType<typeof createAnimator> | null>(null);
  const controller = useMemo(() => createMotion(world.spawn), [world]);
  const [reading, setReading] = useState(false);
  const lastReading = useRef(false);
  const reported = useRef("");
  const { Visual } = characterPackage;
  useEffect(() => {
    const a = createAnimator(rig.current, characterPackage.clips());
    animator.current = a;
    return () => a.dispose();
  }, [asset.id, characterPackage]);
  useEffect(() => {
    const anchor = world.anchors[activity];
    controller.setTarget(
      anchor,
      navigation.findPath(controller.snapshot().position, anchor.position),
    );
  }, [activity, navigation, world, controller]);
  useFrame((_, raw) => {
    const frame = controller.step(raw, paused);
    root.current.position.set(
      frame.position[0] + frame.dockOffset[0],
      frame.position[1] + frame.dockOffset[1],
      frame.position[2] + frame.dockOffset[2],
    );
    root.current.rotation.y = frame.facing;
    const report = `${frame.moving}:${frame.blocked}`;
    if (reported.current !== report) {
      reported.current = report;
      onMotion(frame.moving, frame.blocked);
    }
    if (paused) return;
    const action = frame.blocked
      ? "idle"
      : frame.moving
        ? "walk"
        : frame.arrived
          ? activity
          : "idle";
    animator.current?.play(action);
    animator.current?.update(Math.min(raw, 0.05), reduced);
    const showBook = action === "reading";
    if (lastReading.current !== showBook) {
      lastReading.current = showBook;
      setReading(showBook);
    }
  });
  return (
    <group ref={root} position={world.spawn}>
      <group ref={rig} key={asset.id}>
        <Visual asset={asset} reading={reading} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <circleGeometry args={[0.3, 32]} />
        <meshBasicMaterial
          color="#695e43"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
      {speech && (
        <Html position={[0, 2.27, 0]} center zIndexRange={[35, 30]}>
          <div className="speech" role="status">
            <span className="speech-source">外部消息 · MOCK</span>
            {speech}
          </div>
        </Html>
      )}
    </group>
  );
}
