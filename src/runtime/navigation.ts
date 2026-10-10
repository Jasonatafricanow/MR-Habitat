import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import { Pathfinding } from "three-pathfinding";

export type Point = [number, number, number];
export interface Obstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}
export interface NavigationOptions extends Obstacle {
  obstacles: Obstacle[];
  clearance?: number;
  cellSize?: number;
}
const epsilon = 1e-6;

function validRect(rect: Obstacle): boolean {
  return (
    [rect.minX, rect.maxX, rect.minZ, rect.maxZ].every(Number.isFinite) &&
    rect.minX < rect.maxX &&
    rect.minZ < rect.maxZ
  );
}

// Continuous slab intersection guards whole route segments, including narrow furniture.
function crossesRectangle(a: Point, b: Point, rect: Obstacle): boolean {
  let enter = 0;
  let leave = 1;
  for (const [axis, low, high] of [
    [0, rect.minX + epsilon, rect.maxX - epsilon],
    [2, rect.minZ + epsilon, rect.maxZ - epsilon],
  ]) {
    const delta = b[axis] - a[axis];
    if (Math.abs(delta) < epsilon) {
      if (a[axis] < low || a[axis] > high) return false;
    } else {
      const t1 = (low - a[axis]) / delta;
      const t2 = (high - a[axis]) / delta;
      enter = Math.max(enter, Math.min(t1, t2));
      leave = Math.min(leave, Math.max(t1, t2));
      if (enter > leave) return false;
    }
  }
  return enter <= leave;
}

export function createNavigation(options: NavigationOptions): {
  findPath(start: Point, end: Point): Point[] | null;
  isWalkable(point: Point): boolean;
} {
  const { clearance = 0.15, cellSize = 0.2 } = options;
  const unavailable = { findPath: () => null, isWalkable: () => false };
  if (
    !validRect(options) ||
    !Number.isFinite(clearance) ||
    clearance < 0 ||
    !Number.isFinite(cellSize) ||
    cellSize <= 0 ||
    !options.obstacles.every(validRect)
  )
    return unavailable;
  const floor = {
    minX: options.minX + clearance,
    maxX: options.maxX - clearance,
    minZ: options.minZ + clearance,
    maxZ: options.maxZ - clearance,
  };
  if (!validRect(floor)) return unavailable;
  const obstacles = options.obstacles.map((rect) => ({
    minX: rect.minX - clearance,
    maxX: rect.maxX + clearance,
    minZ: rect.minZ - clearance,
    maxZ: rect.maxZ + clearance,
  }));
  const columns = Math.ceil((floor.maxX - floor.minX) / cellSize);
  const rows = Math.ceil((floor.maxZ - floor.minZ) / cellSize);
  if (columns * rows > 100_000) return unavailable;
  const vertices: number[] = [];
  const cells: Obstacle[] = [];
  // Exclude an entire cell on rectangle overlap, rather than testing only triangle vertices.
  for (let x = 0; x < columns; x++)
    for (let z = 0; z < rows; z++) {
      const cell = {
        minX: floor.minX + x * cellSize,
        maxX: Math.min(floor.maxX, floor.minX + (x + 1) * cellSize),
        minZ: floor.minZ + z * cellSize,
        maxZ: Math.min(floor.maxZ, floor.minZ + (z + 1) * cellSize),
      };
      // three-pathfinding rounds welded coordinates to two decimals. Keep its corners safely outside the clearance rectangle.
      const meshMargin = 0.011;
      if (
        obstacles.some(
          (rect) =>
            cell.minX < rect.maxX + meshMargin &&
            cell.maxX > rect.minX - meshMargin &&
            cell.minZ < rect.maxZ + meshMargin &&
            cell.maxZ > rect.minZ - meshMargin,
        )
      )
        continue;
      // Membership must use the same welded coordinates as the route vertices.
      // Otherwise a valid route on a rounded cell edge cannot be retargeted.
      // Clearance remains guarded by the unrounded obstacle rectangles above.
      cells.push(
        Object.fromEntries(
          Object.entries(cell).map(([key, value]) => [
            key,
            Math.round(value * 100) / 100,
          ]),
        ) as unknown as Obstacle,
      );
      const { minX: a, maxX: b, minZ: c, maxZ: d } = cell;
      vertices.push(a, 0, c, a, 0, d, b, 0, c, b, 0, c, a, 0, d, b, 0, d);
    }
  if (!vertices.length) return unavailable;
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  const pathfinder = new Pathfinding();
  pathfinder.setZoneData("floor", Pathfinding.createZone(geometry));
  geometry.dispose();

  // Match the weld margin at shared corners; obstacle and floor checks remain exact.
  const cellTolerance = 0.011;
  function isWalkable(point: Point): boolean {
    if (!point.every(Number.isFinite) || Math.abs(point[1]) > epsilon)
      return false;
    const [x, , z] = point;
    if (x < floor.minX || x > floor.maxX || z < floor.minZ || z > floor.maxZ)
      return false;
    if (
      obstacles.some(
        (rect) =>
          x > rect.minX - epsilon &&
          x < rect.maxX + epsilon &&
          z > rect.minZ - epsilon &&
          z < rect.maxZ + epsilon,
      )
    )
      return false;
    return cells.some(
      (cell) =>
        x >= cell.minX - cellTolerance &&
        x <= cell.maxX + cellTolerance &&
        z >= cell.minZ - cellTolerance &&
        z <= cell.maxZ + cellTolerance,
    );
  }

  function findPath(start: Point, end: Point): Point[] | null {
    if (!isWalkable(start) || !isWalkable(end)) return null;
    if (
      new Vector3(...start).distanceToSquared(new Vector3(...end)) <
      epsilon * epsilon
    )
      return [[...end]];
    // The library's strict polygon test excludes some exact boundary points.
    // If the direct query fails, enter the interior of a containing cell along
    // a checked segment. Never snap through walls or return an unchecked route.
    const seeds: Point[] = [
      start,
      ...cells
        .filter(
          (cell) =>
            start[0] >= cell.minX - cellTolerance &&
            start[0] <= cell.maxX + cellTolerance &&
            start[2] >= cell.minZ - cellTolerance &&
            start[2] <= cell.maxZ + cellTolerance,
        )
        .map(
          (cell) =>
            [
              (cell.minX + cell.maxX) / 2,
              0,
              (cell.minZ + cell.maxZ) / 2,
            ] as Point,
        ),
    ];
    const to = new Vector3(...end);
    for (const seed of seeds) {
      const from = new Vector3(...seed);
      const group = pathfinder.getGroup("floor", from);
      if (group == null || pathfinder.getGroup("floor", to) !== group) continue;
      const route = pathfinder.findPath(from, to, "floor", group);
      if (
        !route?.length ||
        route.at(-1)!.distanceToSquared(to) > epsilon * epsilon
      )
        continue;
      const points: Point[] = [
        ...(seed === start ? [] : [seed]),
        ...route.map((point) => [point.x, 0, point.z] as Point),
      ];
      let previous = start;
      const safe = points.every((point) => {
        const clear = !obstacles.some((rect) =>
          crossesRectangle(previous, point, rect),
        );
        previous = point;
        return clear;
      });
      if (safe) return points;
    }
    return null;
  }
  return { findPath, isWalkable };
}
