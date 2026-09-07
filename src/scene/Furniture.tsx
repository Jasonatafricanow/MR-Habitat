import { Box, Cylinder, Sphere, Plant, Book } from "./Primitives";

export function Desk() {
  return (
    <group position={[2.1, 0, -2.5]}>
      <Box position={[0, 1.05, 0]} size={[2.7, 0.13, 1.03]} color="#b68b61" />
      {[-1.15, 1.15].flatMap((x) =>
        [-0.35, 0.35].map((z) => (
          <Box
            key={`${x}${z}`}
            position={[x, 0.51, z]}
            size={[0.1, 1, 0.1]}
            color="#816649"
          />
        )),
      )}
      <Box position={[0.9, 0.78, 0]} size={[0.63, 0.4, 0.85]} color="#c3a580" />
      <Box
        position={[0.9, 0.77, 0.434]}
        size={[0.17, 0.035, 0.02]}
        color="#776347"
      />
      <Box
        position={[0, 1.4, -0.23]}
        size={[0.86, 0.57, 0.055]}
        color="#3d4943"
      />
      <Box
        position={[0, 1.4, -0.193]}
        size={[0.76, 0.46, 0.012]}
        color="#a7b9a5"
        radius={0.01}
      />
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          position={[-0.17, 1.52 - i * 0.07, -0.18]}
          size={[0.34 - i * 0.04, 0.016, 0.016]}
          color="#e0e7cb"
        />
      ))}
      <Box
        position={[0, 1.18, -0.23]}
        size={[0.07, 0.22, 0.08]}
        color="#525951"
      />
      <Box
        position={[0, 1.125, -0.2]}
        size={[0.35, 0.025, 0.22]}
        color="#525951"
      />
      <Box
        position={[0, 1.135, 0.23]}
        size={[0.66, 0.034, 0.23]}
        color="#e8ddc7"
      />
      <Book
        position={[-0.79, 1.16, 0.1]}
        rotation={[0, 0.12, 0]}
        color="#647562"
      />
      <Book
        position={[-0.76, 1.24, 0.07]}
        rotation={[0, -0.1, 0]}
        color="#c69860"
      />
      <Cylinder
        position={[0.63, 1.25, 0.25]}
        radius={0.095}
        height={0.22}
        color="#e9ddbb"
      />
      <Cylinder
        position={[0.63, 1.365, 0.25]}
        radius={0.08}
        height={0.012}
        color="#665143"
      />
      <Cylinder
        position={[1.03, 1.14, -0.2]}
        radius={0.17}
        height={0.035}
        color="#b99a51"
      />
      <Cylinder
        position={[1.03, 1.44, -0.2]}
        radius={0.024}
        height={0.6}
        color="#9b813f"
      />
      <mesh position={[1.03, 1.78, -0.2]}>
        <coneGeometry args={[0.23, 0.28, 32, 1, true]} />
        <meshStandardMaterial color="#e0bb69" side={2} />
      </mesh>
    </group>
  );
}

export function Chair() {
  return (
    <group position={[2.1, 0, -1.38]}>
      <Box
        position={[0, 0.55, 0]}
        size={[0.7, 0.13, 0.65]}
        color="#657c6c"
        radius={0.09}
      />
      <Box
        position={[0, 0.89, 0.27]}
        size={[0.7, 0.59, 0.12]}
        color="#718574"
        radius={0.07}
      />
      {[-0.25, 0.25].flatMap((x) =>
        [-0.22, 0.22].map((z) => (
          <Box
            key={`${x}${z}`}
            position={[x, 0.26, z]}
            size={[0.065, 0.53, 0.065]}
            color="#96714e"
          />
        )),
      )}
    </group>
  );
}

export function Sofa({ color }: { color: string }) {
  return (
    <group position={[-3.65, 0, 0.4]} rotation={[0, Math.PI / 2, 0]}>
      {[-0.93, 0.93].flatMap((x) =>
        [-0.35, 0.35].map((z) => (
          <Box
            key={`${x}${z}`}
            position={[x, 0.16, z]}
            size={[0.1, 0.27, 0.1]}
            color="#806443"
          />
        )),
      )}
      <Box
        position={[0, 0.44, 0]}
        size={[2.45, 0.4, 1.03]}
        color={color}
        radius={0.13}
      />
      <Box
        position={[0, 0.92, -0.43]}
        size={[2.4, 0.84, 0.23]}
        color={color}
        radius={0.12}
      />
      {[-0.6, 0.6].map((x) => (
        <Box
          key={x}
          position={[x, 0.68, 0.08]}
          size={[1.1, 0.22, 0.81]}
          color="#a5ad8b"
          radius={0.08}
        />
      ))}
      {[-1.13, 1.13].map((x) => (
        <Box
          key={x}
          position={[x, 0.72, 0]}
          size={[0.24, 0.59, 1.1]}
          color={color}
          radius={0.1}
        />
      ))}
      <Box
        position={[-0.73, 0.94, -0.1]}
        size={[0.46, 0.47, 0.18]}
        color="#d6bf8e"
        rotation={[0, -0.2, 0.2]}
        radius={0.12}
      />
      <Box
        position={[0.65, 0.96, -0.13]}
        size={[0.45, 0.48, 0.16]}
        color="#ede1c7"
        rotation={[0.1, 0.1, -0.15]}
        radius={0.1}
      />
      <Box
        position={[0.67, 0.81, 0.27]}
        size={[0.49, 0.06, 0.67]}
        color="#c69a74"
        radius={0.02}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          position={[0.45 + i * 0.085, 0.797, 0.615]}
          size={[0.013, 0.17, 0.013]}
          color="#dcc3a0"
        />
      ))}
    </group>
  );
}

export function CoffeeTable() {
  return (
    <group position={[-0.95, 0, 0.62]}>
      <Cylinder
        position={[0, 0.51, 0]}
        radius={0.68}
        top={0.7}
        height={0.12}
        color="#b48960"
      />
      {[0, 2.1, 4.2].map((a) => (
        <Box
          key={a}
          position={[Math.cos(a) * 0.4, 0.25, Math.sin(a) * 0.4]}
          size={[0.09, 0.48, 0.09]}
          color="#98714e"
          rotation={[0.1, 0, 0.1]}
        />
      ))}
      <Book
        position={[-0.13, 0.62, 0]}
        rotation={[0, 0.3, 0]}
        color="#8e594a"
        size={[0.38, 0.08, 0.5]}
      />
      <Cylinder
        position={[0.28, 0.66, 0.21]}
        radius={0.11}
        height={0.17}
        color="#eae0c8"
      />
      <Cylinder
        position={[0.28, 0.75, 0.21]}
        radius={0.09}
        height={0.01}
        color="#79614e"
      />
      <Cylinder
        position={[-0.12, 0.63, -0.34]}
        radius={0.1}
        height={0.13}
        color="#d6ac69"
      />
    </group>
  );
}

export function Bookshelf() {
  return (
    <group position={[-0.1, 0, -3.04]}>
      <Box position={[0, 1.03, 0]} size={[1.42, 2.06, 0.44]} color="#96704f" />
      <Box
        position={[0, 1.07, 0.1]}
        size={[1.22, 1.86, 0.31]}
        color="#745c44"
      />
      {[0.16, 0.72, 1.28, 1.84].map((y, j) => (
        <group key={y}>
          <Box
            position={[0, y, 0.12]}
            size={[1.34, 0.07, 0.45]}
            color="#ba9470"
          />
          {j < 3 &&
            [0, 1, 2, 3, 4, 5].map((i) => (
              <Box
                key={i}
                position={[-0.5 + i * 0.18, y + 0.22, 0.14]}
                size={[0.115, 0.28 + ((i + j) % 3) * 0.055, 0.26]}
                color={
                  [
                    "#a8ad8a",
                    "#c88b69",
                    "#dfd0aa",
                    "#738879",
                    "#d2ad68",
                    "#8a6753",
                  ][(i + j) % 6]
                }
                rotation={[0, 0, i === 5 ? 0.13 : 0]}
                radius={0.008}
              />
            ))}
        </group>
      ))}
      <Plant position={[0.34, 2.08, 0]} scale={0.46} />
      <Box
        position={[-0.36, 2.29, 0]}
        size={[0.36, 0.4, 0.045]}
        color="#dcc99f"
      />
      <Box
        position={[-0.36, 2.29, 0.027]}
        size={[0.28, 0.32, 0.01]}
        color="#8e9c83"
      />
    </group>
  );
}

export function FloorLamp() {
  return (
    <group position={[-3.5, 0, 2.35]}>
      <Cylinder
        position={[0, 0.06, 0]}
        radius={0.31}
        height={0.08}
        color="#8e7b52"
      />
      <Cylinder
        position={[0, 1.12, 0]}
        radius={0.025}
        height={2.2}
        color="#94825b"
      />
      <mesh position={[0, 2.1, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.47, 0.56, 32]} />
        <meshStandardMaterial color="#eee0b9" roughness={0.9} />
      </mesh>
      <Sphere position={[0, 1.95, 0]} scale={[0.1, 0.1, 0.1]} color="#ffe4a4" />
    </group>
  );
}
