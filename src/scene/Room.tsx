import { Html } from "@react-three/drei";
import { BookOpen, NotebookPen, Laptop } from "lucide-react";
import { Box, Cylinder, Plant, Sphere } from "./Primitives";
import {
  Desk,
  Chair,
  Sofa,
  CoffeeTable,
  Bookshelf,
  FloorLamp,
} from "./Furniture";
import type { ObjectId } from "../worlds/studio";
import { Floorboards } from "./Floorboards";

export function Room({
  night,
  autumn,
  onSelect,
  showLabels,
}: {
  night: boolean;
  autumn: boolean;
  onSelect: (id: ObjectId) => void;
  showLabels: boolean;
}) {
  const wall = autumn ? "#d7bfaa" : "#ded9c3";
  return (
    <group>
      <Box
        position={[0, -0.31, 0]}
        size={[9.45, 0.57, 7.3]}
        color="#a5825f"
        radius={0.12}
      />
      <Box position={[0, -0.085, 0]} size={[9.25, 0.14, 7.1]} color="#bc976e" />
      <Floorboards />
      <Box position={[-4.55, 1.5, 0]} size={[0.18, 3, 7.15]} color={wall} />
      <Box position={[0, 1.5, -3.5]} size={[9.2, 3, 0.18]} color={wall} />
      <Box
        position={[-4.43, 0.15, 0]}
        size={[0.06, 0.26, 7.05]}
        color="#eae2c9"
      />
      <Box
        position={[0, 0.15, -3.37]}
        size={[9.05, 0.26, 0.06]}
        color="#eae2c9"
      />
      <Box
        position={[-4.55, 3.01, 0]}
        size={[0.24, 0.1, 7.2]}
        color="#eee6d0"
      />
      <Box position={[0, 3.01, -3.5]} size={[9.3, 0.1, 0.24]} color="#eee6d0" />
      {/* A shallow, framed landscape gives the window depth without remote textures. */}
      <group position={[-2.35, 1.89, -3.36]}>
        <Box size={[2.45, 1.85, 0.13]} color="#9f805e" />
        <Box
          position={[0, 0, 0.08]}
          size={[2.25, 1.65, 0.06]}
          color={night ? "#465d70" : "#a9c6c1"}
        />
        <mesh position={[0.62, 0.42, 0.125]}>
          <circleGeometry args={[0.16, 32]} />
          <meshBasicMaterial color={night ? "#eddfb2" : "#f5e5b6"} />
        </mesh>
        {[-0.8, -0.35, 0.2, 0.7].map((x, i) => (
          <mesh key={x} position={[x, -0.38, 0.14 + i * 0.004]}>
            <circleGeometry args={[0.65 + i * 0.035, 24, 0, Math.PI]} />
            <meshBasicMaterial
              color={
                night
                  ? "#425b57"
                  : ["#92aaa0", "#789989", "#688b78", "#8da48a"][i]
              }
            />
          </mesh>
        ))}
        <Box
          position={[0, -0.64, 0.15]}
          size={[2.24, 0.37, 0.015]}
          color={night ? "#425b57" : "#8da48a"}
        />
        {[-1.16, 0, 1.16].map((x) => (
          <Box
            key={x}
            position={[x, 0, 0.22]}
            size={[0.065, 1.79, 0.09]}
            color="#eee5ca"
          />
        ))}
        {[-0.87, 0.04, 0.87].map((y) => (
          <Box
            key={y}
            position={[0, y, 0.22]}
            size={[2.38, 0.065, 0.09]}
            color="#eee5ca"
          />
        ))}
        <Box
          position={[0, -0.96, 0.25]}
          size={[2.68, 0.13, 0.48]}
          color="#e7ddc2"
        />
        <Cylinder
          position={[0, 1.06, 0.22]}
          radius={0.025}
          height={2.97}
          color="#9b805b"
          rotation={[0, 0, Math.PI / 2]}
        />
        {[-1.28, 1.28].map((x) => (
          <group key={x} position={[x, 0.02, 0.3]}>
            {[0, 1, 2].map((i) => (
              <Cylinder
                key={i}
                position={[(i - 1) * 0.12, 0, 0]}
                radius={0.09}
                height={1.9}
                color="#f0e7cf"
              />
            ))}
          </group>
        ))}
        <Plant position={[-0.73, -0.87, 0.26]} scale={0.36} />
      </group>
      <group position={[2.02, 2.16, -3.34]}>
        <Box size={[1.7, 0.97, 0.08]} color="#ac855e" />
        <Box
          position={[0, 0, 0.05]}
          size={[1.57, 0.84, 0.02]}
          color="#c1ae84"
        />
        {[
          [-0.45, 0.12, 0.15],
          [0.1, -0.12, -0.1],
          [0.48, 0.12, 0.06],
        ].map(([x, y, a], i) => (
          <group key={i} position={[x, y, 0.07]} rotation={[0, 0, a]}>
            <Box
              size={[0.38, 0.42, 0.012]}
              color={["#e8ddb8", "#f0e9d2", "#cbd2b4"][i]}
            />
            <Sphere
              position={[0, 0.16, 0.02]}
              scale={[0.022, 0.022, 0.012]}
              color="#a0704e"
            />
            {[0, 1, 2].map((j) => (
              <Box
                key={j}
                position={[0, 0.04 - j * 0.07, 0.012]}
                size={[0.21 - j * 0.02, 0.012, 0.005]}
                color="#b5a585"
              />
            ))}
          </group>
        ))}
      </group>
      {/* Woven rug, not a UI plane. */}
      <Box
        position={[-1.13, 0.022, 0.8]}
        size={[3.92, 0.045, 3.13]}
        color="#ddd1ad"
        radius={0.08}
      />
      <Box
        position={[-1.13, 0.047, 0.8]}
        size={[3.65, 0.009, 2.88]}
        color="#c5b990"
      />
      <Box
        position={[-1.13, 0.053, 0.8]}
        size={[3.5, 0.006, 2.71]}
        color="#ded1ac"
      />
      {Array.from({ length: 30 }, (_, i) => (
        <Box
          key={i}
          position={[-2.88 + i * 0.12, 0.061, 0.8]}
          size={[0.013, 0.005, 2.7]}
          color="#cec29f"
          radius={0.001}
        />
      ))}
      {[-0.83, 2.43].flatMap((z) =>
        Array.from({ length: 28 }, (_, i) => (
          <Box
            key={`${z}-${i}`}
            position={[-2.78 + i * 0.12, 0.03, z]}
            size={[0.021, 0.022, 0.19]}
            color="#dfd2ad"
          />
        )),
      )}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect("desk");
        }}
      >
        <Desk />
      </group>
      <Chair />
      <Sofa color={autumn ? "#a68367" : "#89977b"} />
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect("journal");
        }}
      >
        <CoffeeTable />
      </group>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect("books");
        }}
      >
        <Bookshelf />
      </group>
      <FloorLamp />
      <Plant position={[-3.8, 0, -2.58]} scale={1.4} />
      <Plant position={[3.85, 0, 2.48]} scale={1.65} />
      <group position={[3.8, 0, -2.5]}>
        <Box
          position={[0, 0.44, 0]}
          size={[0.54, 0.84, 0.69]}
          color="#b58d62"
        />
        <Box position={[0, 0.9, 0]} size={[0.64, 0.08, 0.76]} color="#c8a47a" />
        <Plant position={[0, 0.95, 0]} scale={0.55} />
      </group>
      <group position={[-4.42, 1.9, 0.52]} rotation={[0, Math.PI / 2, 0]}>
        <Box size={[1.15, 0.84, 0.05]} color="#a7855f" />
        <Box
          position={[0, 0, 0.035]}
          size={[1.01, 0.7, 0.01]}
          color="#e9dec2"
        />
        <mesh position={[0.21, 0.12, 0.044]}>
          <circleGeometry args={[0.15, 24]} />
          <meshBasicMaterial color="#c89d64" />
        </mesh>
        <Box
          position={[-0.1, -0.16, 0.045]}
          size={[0.7, 0.12, 0.004]}
          color="#9aab8a"
        />
        <Box
          position={[0.1, -0.26, 0.046]}
          size={[0.75, 0.11, 0.004]}
          color="#768c70"
        />
      </group>
      {showLabels && (
        <>
          <Html position={[2.1, 1.9, -2.1]} center zIndexRange={[20, 10]}>
            <button
              className="object-pin"
              aria-label="查看桌上的事"
              onClick={() => onSelect("desk")}
            >
              <Laptop size={14} />
              <span>桌上的事</span>
              <span className="pin-dot" />
            </button>
          </Html>
          <Html position={[-0.1, 2.62, -3]} center zIndexRange={[20, 10]}>
            <button
              className="object-pin"
              aria-label="查看书架"
              onClick={() => onSelect("books")}
            >
              <BookOpen size={14} />
              <span>书架</span>
              <span className="pin-dot" />
            </button>
          </Html>
          <Html position={[-1, 1.02, 0.7]} center zIndexRange={[20, 10]}>
            <button
              className="object-pin"
              aria-label="查看小屋日记"
              onClick={() => onSelect("journal")}
            >
              <NotebookPen size={14} />
              <span>日记</span>
              <span className="pin-dot" />
            </button>
          </Html>
        </>
      )}
    </group>
  );
}
