import type { ObjectId } from "../worlds/studio";
export type Vec3 = [number, number, number];
export interface Bounds {
  min: Vec3;
  max: Vec3;
}
export interface ModelInfo {
  bounds: Bounds;
  meshes: number;
  materials: number;
  materialTypes: string[];
  textures: number;
  vertices: number;
  triangles: number;
  bytes: number;
  animations: number;
}
export type Binding =
  | { kind: "none" }
  | { kind: "wardrobe" }
  | { kind: "projection"; key: ObjectId };
export interface AssetDescriptor {
  schemaVersion: 1;
  id: string;
  displayName: string;
  category: string;
  glbRef: string;
  movable: boolean;
  defaultScale: number;
  localTransform: { offset: Vec3; yaw: number };
  collision: { strategy: "aabb" | "none" };
  interaction: Binding;
  info: ModelInfo;
}
export interface Placement {
  id: string;
  assetId: string;
  x: number;
  z: number;
  yaw: number;
  scale: number;
}
export const instanceId = "xiyue-home-v1:local";
export function normalOffset(b: Bounds, ground: boolean): Vec3 {
  return [
    -(b.min[0] + b.max[0]) / 2,
    ground ? -b.min[1] : 0,
    -(b.min[2] + b.max[2]) / 2,
  ];
}
export function makeDescriptor(
  name: string,
  info: ModelInfo,
  id: string = crypto.randomUUID(),
): AssetDescriptor {
  return {
    schemaVersion: 1,
    id,
    displayName: name,
    category: "家具",
    glbRef: `indexeddb:${id}`,
    movable: true,
    defaultScale: 1,
    localTransform: { offset: normalOffset(info.bounds, true), yaw: 0 },
    collision: { strategy: "aabb" },
    interaction: { kind: "none" },
    info,
  };
}
export function descriptorError(d: AssetDescriptor): string | null {
  if (
    d.schemaVersion !== 1 ||
    !d.id ||
    d.glbRef !== `indexeddb:${d.id}` ||
    !d.displayName.trim() ||
    d.displayName.length > 100
  )
    return "资产名称或版本无效";
  if (
    !Number.isFinite(d.defaultScale) ||
    d.defaultScale < 0.001 ||
    d.defaultScale > 1000 ||
    !Number.isFinite(d.localTransform.yaw) ||
    d.localTransform.offset.length !== 3 ||
    !d.localTransform.offset.every(Number.isFinite)
  )
    return "缩放或原点设置无效";
  if (
    !["none", "aabb"].includes(d.collision.strategy) ||
    !["none", "wardrobe", "projection"].includes(d.interaction.kind)
  )
    return "资产属性无效";
  if (
    d.interaction.kind === "projection" &&
    !["desk", "books", "journal"].includes(d.interaction.key)
  )
    return "投影入口无效";
  return null;
}
export function footprint(d: AssetDescriptor, p: Placement) {
  const scale = d.defaultScale * p.scale,
    yaw = d.localTransform.yaw + p.yaw,
    c = Math.cos(yaw),
    s = Math.sin(yaw),
    b = d.info.bounds,
    o = d.localTransform.offset;
  const points = [b.min[0], b.max[0]].flatMap((x) =>
    [b.min[2], b.max[2]].map((z) => ({
      x: p.x + scale * (c * (x + o[0]) + s * (z + o[2])),
      z: p.z + scale * (-s * (x + o[0]) + c * (z + o[2])),
    })),
  );
  return {
    minX: Math.min(...points.map((p) => p.x)),
    maxX: Math.max(...points.map((p) => p.x)),
    minZ: Math.min(...points.map((p) => p.z)),
    maxZ: Math.max(...points.map((p) => p.z)),
  };
}
