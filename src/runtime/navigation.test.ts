import { describe, expect, it } from "vitest";
import { createNavigation, type Point } from "./navigation";

const bounds = { minX: -3, maxX: 3, minZ: -3, maxZ: 3 };
describe("authored floor navigation", () => {
  it("routes around inflated furniture with every segment clear", () => {
    const nav = createNavigation({
      ...bounds,
      obstacles: [{ minX: -0.6, maxX: 0.6, minZ: -0.8, maxZ: 0.8 }],
    });
    const start: Point = [-2, 0, 0];
    const end: Point = [2, 0, 0];
    const route = nav.findPath(start, end);
    expect(route).not.toBeNull();
    expect(route!.at(-1)).toEqual(end);
    expect(route!.length).toBeGreaterThan(1);
    const points = [start, ...route!];
    for (let i = 1; i < points.length; i++) {
      for (let step = 0; step <= 200; step++) {
        const t = step / 200;
        const x = points[i - 1][0] * (1 - t) + points[i][0] * t;
        const z = points[i - 1][2] * (1 - t) + points[i][2] * t;
        expect(x > -0.75 && x < 0.75 && z > -0.95 && z < 0.95).toBe(false);
      }
    }
  });
  it("rejects blocked, off-floor, outside, and nonfinite endpoints", () => {
    const nav = createNavigation({
      ...bounds,
      obstacles: [{ minX: -0.6, maxX: 0.6, minZ: -0.8, maxZ: 0.8 }],
    });
    expect(nav.isWalkable([-2, 0, 0])).toBe(true);
    for (const bad of [
      [0, 0, 0],
      [0.7, 0, 0],
      [3, 0, 0],
      [-4, 0, 0],
      [NaN, 0, 0],
      [0, 1, -2],
    ] as Point[]) {
      expect(nav.isWalkable(bad)).toBe(false);
      expect(nav.findPath(bad, [-2, 0, 0])).toBeNull();
      expect(nav.findPath([-2, 0, 0], bad)).toBeNull();
    }
  });
  it("does not bridge disconnected regions or fully blocked floors", () => {
    const divided = createNavigation({
      ...bounds,
      obstacles: [{ minX: -0.2, maxX: 0.2, minZ: -3, maxZ: 3 }],
    });
    expect(divided.isWalkable([-2, 0, 0])).toBe(true);
    expect(divided.isWalkable([2, 0, 0])).toBe(true);
    expect(divided.findPath([-2, 0, 0], [2, 0, 0])).toBeNull();
    const blocked = createNavigation({ ...bounds, obstacles: [bounds] });
    expect(blocked.findPath([-2, 0, 0], [2, 0, 0])).toBeNull();
  });
  it("keeps a thin obstacle from disappearing between grid vertices", () => {
    const nav = createNavigation({
      ...bounds,
      clearance: 0,
      cellSize: 0.5,
      obstacles: [{ minX: 0.11, maxX: 0.12, minZ: -3, maxZ: 3 }],
    });
    expect(nav.findPath([-2, 0, 0], [2, 0, 0])).toBeNull();
    expect(nav.isWalkable([0.115, 0, 1])).toBe(false);
  });
  it("reaches an unobstructed endpoint and supports a stationary destination", () => {
    const nav = createNavigation({ ...bounds, obstacles: [] });
    expect(nav.findPath([-2, 0, -2], [2, 0, 2])?.at(-1)).toEqual([2, 0, 2]);
    expect(nav.findPath([0, 0, 0], [0, 0, 0])?.at(-1)).toEqual([0, 0, 0]);
  });
});
