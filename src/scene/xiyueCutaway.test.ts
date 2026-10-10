import { describe, expect, it } from "vitest";
import { walls } from "../worlds/xiyue";
import { cutsAway, wallOwner } from "./xiyueArchitecture";

const wall = (x: number, z: number) =>
  walls.find((v) => v[0] === x && v[1] === z)!;

describe("walls cutaway", () => {
  it("drops the near exterior wall and keeps the far one", () => {
    const front = wall(1.3, 4.2);
    const back = wall(-3.3, -3.6);
    // Camera south of the house, looking north.
    expect(cutsAway(front, 0, 1)).toBe(true);
    expect(cutsAway(back, 0, 1)).toBe(false);
    // Orbit to the north side: roles swap.
    expect(cutsAway(front, 0, -1)).toBe(false);
    expect(cutsAway(back, 0, -1)).toBe(true);
  });
  it("keeps walls seen edge-on at full height", () => {
    expect(cutsAway(wall(1.3, 4.2), 1, 0)).toBe(false);
    expect(cutsAway(wall(5.4, 0.4), 0, 1)).toBe(false);
  });
  it("cuts an interior partition that hides the room behind it", () => {
    // Bedroom/bath wall seen from the south hides the bedroom.
    expect(cutsAway(wall(-3.3, 0.4), 0, 1)).toBe(true);
  });
  it("hangs the entry door and front window on the front wall line", () => {
    for (const [x, z] of [
      [-0.9, 4.2],
      [1.42, 4.2],
    ])
      expect(walls[wallOwner(x, z)][1]).toBe(4.2);
  });
});
