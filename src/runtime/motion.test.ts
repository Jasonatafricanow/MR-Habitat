import { describe, expect, it } from "vitest";
import { createMotion } from "./motion";
import type { Point } from "./navigation";

function advance(motion: ReturnType<typeof createMotion>, seconds: number) {
  for (let tick = 0; tick < Math.ceil(seconds / 0.01); tick++)
    motion.step(0.01, false);
  return motion.snapshot();
}

describe("visual locomotion", () => {
  it("holds a blocked route until a new successful target", () => {
    const motion = createMotion([0, 0, 0]);
    motion.setTarget({ position: [1, 0, 0], facing: 0 }, null);
    expect(advance(motion, 10)).toMatchObject({
      position: [0, 0, 0],
      blocked: true,
      moving: false,
      arrived: false,
    });
    motion.setTarget({ position: [1, 0, 0], facing: 0 }, [[1, 0, 0]]);
    expect(advance(motion, 3)).toMatchObject({
      position: [1, 0, 0],
      blocked: false,
      moving: false,
      arrived: true,
    });
  });
  it("bounds movement speed and turns gradually toward travel", () => {
    const motion = createMotion([0, 0, 0]);
    motion.setTarget({ position: [2, 0, 0], facing: Math.PI }, [[2, 0, 0]]);
    const state = motion.step(0.05, false);
    expect(state.position[0]).toBeCloseTo(0.036);
    expect(state.facing).toBeGreaterThan(0);
    expect(state.facing).toBeLessThan(Math.PI / 2);
    const afterLag = motion.step(20, false);
    expect(afterLag.position[0] - state.position[0]).toBeLessThanOrEqual(
      0.036 + 1e-10,
    );
    expect(afterLag.moving).toBe(true);
    expect(afterLag.arrived).toBe(false);
  });
  it("docks visually while retaining the walkable approach, then undocks before moving", () => {
    const motion = createMotion([0, 0, 0]);
    motion.setTarget(
      { position: [0.36, 0, 0], facing: 0, dock: [0.36, 0.2, -0.5] },
      [[0.36, 0, 0]],
    );
    const docking = advance(motion, 0.7);
    expect(docking.position).toEqual([0.36, 0, 0]);
    expect(docking.dockOffset[2]).toBeLessThan(0);
    expect(docking.dockOffset[2]).toBeGreaterThan(-0.5);
    expect(docking.arrived).toBe(false);
    expect(advance(motion, 0.7)).toMatchObject({
      position: [0.36, 0, 0],
      dockOffset: [0, 0.2, -0.5],
      arrived: true,
      moving: false,
    });
    motion.setTarget({ position: [1, 0, 0], facing: 0 }, [[1, 0, 0]]);
    const undocking = advance(motion, 0.4);
    expect(undocking.position).toEqual([0.36, 0, 0]);
    expect(undocking.dockOffset[2]).toBeLessThan(0);
    expect(undocking.arrived).toBe(false);
    advance(motion, 0.3);
    expect(motion.snapshot().dockOffset).toEqual([0, 0, 0]);
    expect(motion.snapshot().position[0]).toBeGreaterThan(0.36);
  });
  it("freezes travel, docking and undocking when paused", () => {
    const motion = createMotion([0, 0, 0]);
    motion.setTarget(
      { position: [0.36, 0, 0], facing: 1, dock: [0.36, 0, -0.5] },
      [[0.36, 0, 0]],
    );
    for (const elapsed of [0.2, 0.5]) {
      advance(motion, elapsed);
      const before = motion.snapshot();
      for (let i = 0; i < 100; i++) motion.step(0.05, true);
      expect(motion.snapshot()).toEqual(before);
    }
    motion.setTarget({ position: [1, 0, 0], facing: 0 }, [[1, 0, 0]]);
    advance(motion, 0.2);
    const before = motion.snapshot();
    expect(motion.step(0.05, true)).toEqual(before);
  });
  it("retargets mid-docking continuously and fully undocks before the next route", () => {
    const motion = createMotion([0, 0, 0]);
    motion.setTarget(
      { position: [0, 0, 0], facing: 0, dock: [0, 0, -0.5] },
      [],
    );
    const partial = advance(motion, 0.3);
    expect(partial.dockOffset[2]).toBeLessThan(0);
    motion.setTarget({ position: [1, 0, 0], facing: 1 }, [[1, 0, 0]]);
    expect(motion.snapshot().dockOffset).toEqual(partial.dockOffset);
    const undocking = advance(motion, 0.3);
    expect(undocking.position).toEqual([0, 0, 0]);
    expect(undocking.dockOffset[2]).toBeGreaterThan(partial.dockOffset[2]);
    motion.setTarget({ position: [-1, 0, 0], facing: -1 }, [[-1, 0, 0]]);
    expect(advance(motion, 0.6).position).toEqual([0, 0, 0]);
    expect(advance(motion, 3)).toMatchObject({
      position: [-1, 0, 0],
      dockOffset: [0, 0, 0],
      arrived: true,
    });
  });
  it("clones spawn, route, anchor and returned positions", () => {
    const spawn: Point = [0, 0, 0];
    const destination: Point = [0.36, 0, 0];
    const dock: Point = [0.36, 0, -0.5];
    const route: Point[] = [[0.36, 0, 0]];
    const motion = createMotion(spawn);
    motion.setTarget({ position: destination, dock, facing: 0 }, route);
    spawn[0] = 50;
    destination[0] = 60;
    dock[2] = -10;
    route[0][0] = 70;
    motion.snapshot().position[0] = 80;
    expect(advance(motion, 2)).toMatchObject({
      position: [0.36, 0, 0],
      dockOffset: [0, 0, -0.5],
      arrived: true,
    });
    motion.snapshot().dockOffset[2] = 100;
    expect(motion.snapshot().dockOffset[2]).toBe(-0.5);
  });
});
