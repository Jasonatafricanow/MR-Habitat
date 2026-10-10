import { describe, expect, it } from "vitest";
import { rooms, walls, props, fixtures } from "./xiyue";

describe("source floor-plan structure", () => {
  it("forms the entry's L return wall, leaving an offset opening on the kitchen side", () => {
    const wall = walls.find(
      ([x, z, w]) =>
        z === 2 &&
        Math.abs(x - w / 2 + 1.8) < 0.001 &&
        Math.abs(x + w / 2 + 0.9) < 0.001,
    );
    expect(wall).toBeDefined();
  });
  it("aligns the entry and kitchen front while the kitchen extends inward", () => {
    const entry = rooms.find((r) => r.id === "entry")!;
    const kitchen = rooms.find((r) => r.id === "kitchen")!;
    expect(kitchen.z + kitchen.d / 2).toBeCloseTo(entry.z + entry.d / 2);
    expect(kitchen.z - kitchen.d / 2).toBeLessThan(entry.z - entry.d / 2);
  });
  it("puts the bed's long axis east-west and its bedside table against the west wall", () => {
    const bed = props.find((p) => p.id === "bed")!;
    const bedside = props.find((p) => p.id === "nightstand")!;
    expect(bed.w).toBeGreaterThan(bed.d);
    expect(bed.rotation).toBeCloseTo(Math.PI / 2);
    expect(bedside.x).toBeLessThan(bed.x);
  });
  it("places the toilet north, the shower west and the basin against the shared bedroom wall", () => {
    const toilet = fixtures.find((p) => p.id === "toilet")!;
    const shower = fixtures.find((p) => p.id === "shower")!;
    const basin = fixtures.find((p) => p.id === "vanity")!;
    expect(toilet.z).toBeLessThan(shower.z);
    expect(shower.x).toBeLessThan(basin.x);
    expect(basin.z).toBeLessThan(1);
    expect(basin.rotation).toBeCloseTo(Math.PI);
  });
  it("closes the bedroom/bath shared wall and gives the bath a bounded east doorway", () => {
    expect(
      walls.some(
        ([x, z, w]) => z === 0.4 && x - w / 2 <= -5 && x + w / 2 >= -1.6,
      ),
    ).toBe(true);
    const segments = walls
      .filter(([x]) => x === -2.8)
      .map(([, z, , d]) => [z - d / 2, z + d / 2])
      .sort((a, b) => a[0] - b[0]);
    expect(segments).toHaveLength(2);
    expect(segments[0][0]).toBeCloseTo(0.4);
    expect(segments[1][1]).toBeCloseTo(3.2);
    expect(segments[1][0] - segments[0][1]).toBeCloseTo(0.9);
  });
});
