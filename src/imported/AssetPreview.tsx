import { Component, useEffect, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Object3D } from "three";
import { NormalizedModel } from "./ImportedLayer";
import type { AssetDescriptor } from "./descriptor";
class PreviewBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p role="alert">此模型无法预览，请重新选择文件。房间仍可使用。</p>
    ) : (
      this.props.children
    );
  }
}
function Fit({ descriptor: d }: { descriptor: AssetDescriptor }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const b = d.info.bounds,
      span =
        Math.max(...b.max.map((n, i) => n - b.min[i])) * d.defaultScale || 1;
    camera.position.set(span * 2, span * 1.5, span * 2);
    camera.lookAt(0, span / 2, 0);
    if ("zoom" in camera) {
      camera.zoom = Math.min(size.width, size.height) / (span * 2.3);
      camera.updateProjectionMatrix();
    }
  }, [d, size, camera]);
  return null;
}
export function AssetPreview({
  scene,
  descriptor,
}: {
  scene: Object3D;
  descriptor: AssetDescriptor;
}) {
  const h =
    (descriptor.info.bounds.max[1] + descriptor.localTransform.offset[1]) *
    descriptor.defaultScale;
  return (
    <div className="asset-preview" aria-label="三维资产预览">
      <PreviewBoundary key={scene.uuid}>
        <Canvas
          orthographic
          frameloop="demand"
          camera={{ position: [3, 2, 3], near: 0.001, far: 100000 }}
          dpr={[1, 1.5]}
        >
          <color attach="background" args={["#e5e2d8"]} />
          <ambientLight intensity={1.5} />
          <directionalLight position={[3, 5, 4]} intensity={2} />
          <NormalizedModel scene={scene} descriptor={descriptor} />
          <gridHelper args={[10, 20, "#9b9b85", "#c8c5b7"]} />
          <OrbitControls makeDefault target={[0, h / 2, 0]} />
          <Fit descriptor={descriptor} />
        </Canvas>
      </PreviewBoundary>
    </div>
  );
}
