import { createNavigation } from "../runtime/navigation";
import {
  buildHome,
  interactionAnchors,
  furnitureObstacle,
  defaultLayout,
  type Layout,
} from "./xiyue";
export function validateLayout(layout: Layout): string | null {
  for (const id of ["sofa", "coffee"] as const) {
    const r = furnitureObstacle(id, layout[id]);
    if (r.minX < -1.4 || r.maxX > 2 || r.minZ < -2.55 || r.maxZ > 1.8)
      return "家具需留在客厅内";
  }
  const a = furnitureObstacle("sofa", layout.sofa),
    b = furnitureObstacle("coffee", layout.coffee);
  if (a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ)
    return "家具不能重叠";
  const world = buildHome(layout),
    nav = createNavigation({
      ...world.bounds,
      obstacles: world.obstacles,
      clearance: 0.2,
      cellSize: world.navigationCellSize,
    });
  if (
    Object.values(interactionAnchors(layout)).some(
      (a) => !nav.findPath(world.spawn, a.position),
    )
  )
    return "此布局阻挡了通道或家具接近点，请调整";
  return null;
}
export function safeLayout(layout: Layout): Layout {
  return validateLayout(layout) ? structuredClone(defaultLayout) : layout;
}
