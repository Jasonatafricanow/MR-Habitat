import { RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

type V3 = [number, number, number];
export function Box({
  position = [0, 0, 0],
  size,
  color,
  radius = 0.03,
  rotation,
  ...rest
}: {
  position?: V3;
  size: V3;
  color: string;
  radius?: number;
  rotation?: V3;
} & Omit<
  ThreeElements["mesh"],
  "position" | "scale" | "rotation" | "args" | "ref"
>) {
  return (
    <RoundedBox
      args={size}
      position={position}
      radius={Math.min(radius, ...size.map((v) => v / 3))}
      smoothness={2}
      rotation={rotation}
      castShadow
      receiveShadow
      {...rest}
    >
      <meshStandardMaterial color={color} roughness={0.86} />
    </RoundedBox>
  );
}
export function Cylinder({
  position = [0, 0, 0],
  radius = 0.1,
  height = 0.3,
  color,
  top,
  rotation,
}: {
  position?: V3;
  radius?: number;
  top?: number;
  height?: number;
  color: string;
  rotation?: V3;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[top ?? radius, radius, height, 24]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}
export function Sphere({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  color,
}: {
  position?: V3;
  scale?: V3;
  color: string;
}) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <sphereGeometry args={[1, 20, 14]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}
export function Plant({
  position,
  scale = 1,
}: {
  position: V3;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <Cylinder
        position={[0, 0.22, 0]}
        radius={0.24}
        top={0.3}
        height={0.44}
        color="#bb785d"
      />
      <Cylinder
        position={[0, 0.43, 0]}
        radius={0.27}
        height={0.035}
        color="#534536"
      />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <group key={i} rotation={[0, i * 2.4, 0]}>
          <Cylinder
            position={[0.08, 0.67 + i * 0.028, 0]}
            radius={0.015}
            height={0.52 + i * 0.05}
            color="#62704d"
            rotation={[0, 0, -0.25]}
          />
          <group position={[0.18, 0.75 + i * 0.06, 0]} rotation={[0, 0, -0.65]}>
            <Sphere
              scale={[0.14, 0.34, 0.07]}
              color={i % 2 ? "#79885c" : "#556e4c"}
            />
          </group>
        </group>
      ))}
    </group>
  );
}
export function Book({
  position,
  rotation = [0, 0, 0],
  color = "#b66a52",
  size = [0.35, 0.07, 0.47],
}: {
  position: V3;
  rotation?: V3;
  color?: string;
  size?: V3;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Box size={size} color={color} radius={0.01} />
      <Box
        position={[0.015, 0, 0]}
        size={[size[0] - 0.035, size[1] * 0.55, size[2] - 0.03]}
        color="#ede2c9"
        radius={0.005}
      />
    </group>
  );
}
