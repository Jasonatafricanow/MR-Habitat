import type { Anchor, WorldDefinition } from "../worlds/studio";
import {
  createNavigation,
  type Obstacle,
  type Point,
} from "../runtime/navigation";
import { rooms, homeScale } from "../worlds/xiyue";
import {
  footprint,
  type AssetDescriptor,
  type Placement,
  descriptorError,
} from "./descriptor";
const overlaps = (a: Obstacle, b: Obstacle) =>
  a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
export function composePlacements(
  base: WorldDefinition,
  assets: AssetDescriptor[],
  placements: Placement[],
  protectedAnchors: Anchor[],
) {
  const fail = (error: string) => ({
    error,
    world: base,
    approaches: {} as Record<string, Anchor>,
  });
  if (!placements.length)
    return {
      error: null,
      world: base,
      approaches: {} as Record<string, Anchor>,
    };
  if (placements.length > 32) return fail("房间最多放入 32 个导入物件");
  const obstacles = [...base.obstacles],
    boxes = new Map<string, Obstacle>(),
    ids = new Set<string>();
  for (const p of placements) {
    const d = assets.find((a) => a.id === p.assetId);
    if (!d) return fail("有物件缺少资产文件，请在资产库中移除该摆放");
    try {
      if (descriptorError(d)) return fail("资产属性无效，请移除并重新导入");
    } catch {
      return fail("资产属性损坏，请移除并重新导入");
    }
    if (
      ids.has(p.id) ||
      ![p.x, p.z, p.yaw, p.scale].every(Number.isFinite) ||
      p.scale < 0.01 ||
      p.scale > 100
    )
      return fail("位置、角度或缩放无效");
    ids.add(p.id);
    const box = footprint(d, p);
    boxes.set(p.id, box);
    if (
      [box.minX, box.maxX].some((x) =>
        [box.minZ, box.maxZ].some(
          (z) =>
            !rooms.some(
              (r) =>
                x >= homeScale * (r.x - r.w / 2) &&
                x <= homeScale * (r.x + r.w / 2) &&
                z >= homeScale * (r.z - r.d / 2) &&
                z <= homeScale * (r.z + r.d / 2),
            ),
        ),
      )
    )
      return fail(`${d.displayName} 超出房间地板`);
    if (d.collision.strategy === "aabb") {
      if (box.maxX - box.minX < 0.001 || box.maxZ - box.minZ < 0.001)
        return fail("模型太薄，无法用包围盒阻挡通行；请选择装饰物");
      if (obstacles.some((b) => overlaps(box, b)))
        return fail(`${d.displayName} 与墙体或家具重叠，请调整位置`);
      obstacles.push(box);
    }
  }
  const world = { ...base, obstacles },
    nav = createNavigation({
      ...world.bounds,
      obstacles,
      clearance: 0.2,
      cellSize: world.navigationCellSize,
    });
  if (protectedAnchors.some((a) => !nav.findPath(base.spawn, a.position)))
    return fail("此摆放阻挡房间通道或原有交互位置");
  const approaches: Record<string, Anchor> = {};
  for (const p of placements) {
    const d = assets.find((a) => a.id === p.assetId)!;
    if (d.interaction.kind === "none") continue;
    const b = boxes.get(p.id)!,
      x = (b.minX + b.maxX) / 2,
      z = (b.minZ + b.maxZ) / 2;
    const candidates: Point[] = [
      [x, 0, b.maxZ + 0.5],
      [b.minX - 0.5, 0, z],
      [b.maxX + 0.5, 0, z],
      [x, 0, b.minZ - 0.5],
    ];
    const position = candidates.find((point) =>
      nav.findPath(base.spawn, point),
    );
    if (!position) return fail(`${d.displayName} 没有可达的接近位置`);
    approaches[p.id] = {
      position,
      facing: Math.atan2(x - position[0], z - position[2]),
      label: `查看${d.displayName}`,
    };
  }
  return { error: null, world, approaches };
}
