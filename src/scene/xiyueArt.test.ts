import { expect, it } from "vitest";
import { buildHome, defaultLayout, props, homeScale } from "../worlds/xiyue";

it("gives new freestanding furnishings real navigation footprints", () => {
  const world = buildHome(defaultLayout);
  for (const id of [
    "living-books",
    "fridge",
    "nook-table",
    "nightstand",
    "study-chair",
    "balcony-table",
    "entry-bench",
    "entry-plant",
    "living-chair",
    "balcony-plant",
  ]) {
    const p = props.find((p) => p.id === id);
    expect(p, id).toBeDefined();
    expect(world.obstacles).toContainEqual({
      minX: (p!.x - p!.w / 2) * homeScale,
      maxX: (p!.x + p!.w / 2) * homeScale,
      minZ: (p!.z - p!.d / 2) * homeScale,
      maxZ: (p!.z + p!.d / 2) * homeScale,
    });
  }
});
