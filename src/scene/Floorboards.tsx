import { useLayoutEffect, useRef } from "react";
import { Color, InstancedMesh, Object3D } from "three";

/** 115 planks share one draw call and geometry. */
export function Floorboards() {
  const mesh = useRef<InstancedMesh>(null!);
  useLayoutEffect(() => {
    const transform = new Object3D(),
      color = new Color();
    for (let i = 0; i < 23; i++)
      for (let j = 0; j < 5; j++) {
        const index = i * 5 + j;
        transform.position.set(-4.39 + i * 0.4, -0.004, -2.82 + j * 1.4);
        transform.updateMatrix();
        mesh.current.setMatrixAt(index, transform.matrix);
        mesh.current.setColorAt(
          index,
          color.set(
            ["#c6a67c", "#cbb087", "#d3b58b", "#c5a378", "#ccb08a"][
              (i * 7 + j * 3) % 5
            ],
          ),
        );
      }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor)
      mesh.current.instanceColor.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 115]} receiveShadow>
      <boxGeometry args={[0.392, 0.025, 1.39]} />
      <meshStandardMaterial roughness={0.88} />
    </instancedMesh>
  );
}
