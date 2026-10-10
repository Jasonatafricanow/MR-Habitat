import { Component, useMemo, type ReactNode } from "react";
import { Html } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Object3D } from "three";
import type { AssetDescriptor, Placement } from "./descriptor";
import type { LoadedAsset } from "./useRegistry";
export function NormalizedModel({
  scene,
  descriptor,
}: {
  scene: Object3D;
  descriptor: AssetDescriptor;
}) {
  const visual = useMemo(() => clone(scene), [scene]);
  return (
    <group
      scale={descriptor.defaultScale}
      rotation={[0, descriptor.localTransform.yaw, 0]}
    >
      <group position={descriptor.localTransform.offset}>
        <primitive object={visual} dispose={null} />
      </group>
    </group>
  );
}
class ModelBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <Html>
        <span>模型显示失败，请移除该资产</span>
      </Html>
    ) : (
      this.props.children
    );
  }
}
export function ImportedLayer({
  assets,
  placements,
  onInteract,
  labels,
}: {
  assets: LoadedAsset[];
  placements: Placement[];
  onInteract: (p: Placement, d: AssetDescriptor) => void;
  labels: boolean;
}) {
  return (
    <group name="ImportedInstanceProps">
      {placements.map((p) => {
        const a = assets.find((a) => a.descriptor.id === p.assetId);
        if (!a?.scene) return null;
        const d = a.descriptor;
        const interactive = d.interaction.kind !== "none";
        return (
          <group
            key={p.id}
            position={[p.x, 0, p.z]}
            rotation={[0, p.yaw, 0]}
            scale={p.scale}
            onClick={(e) => {
              if (interactive) {
                e.stopPropagation();
                onInteract(p, d);
              }
            }}
          >
            <ModelBoundary>
              <NormalizedModel scene={a.scene} descriptor={d} />
              {interactive && labels && (
                <Html
                  position={[
                    0,
                    (d.info.bounds.max[1] + d.localTransform.offset[1]) *
                      d.defaultScale +
                      0.2,
                    0,
                  ]}
                  center
                  zIndexRange={[22, 12]}
                >
                  <button
                    className="home-marker"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInteract(p, d);
                    }}
                  >
                    {d.displayName}
                  </button>
                </Html>
              )}
            </ModelBoundary>
          </group>
        );
      })}
    </group>
  );
}
