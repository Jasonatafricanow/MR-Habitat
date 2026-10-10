import { expect, it } from "vitest";
import { composePlacements } from "./placement";
import { makeDescriptor, type ModelInfo } from "./descriptor";
import { buildHome, defaultLayout, interactionAnchors } from "../worlds/xiyue";
import { createNavigation } from "../runtime/navigation";
const info: ModelInfo = {
  bounds: { min: [-0.25, 0, -0.2], max: [0.25, 0.6, 0.2] },
  meshes: 1,
  materials: 1,
  materialTypes: [],
  textures: 0,
  vertices: 36,
  triangles: 12,
  bytes: 300,
  animations: 0,
};
const asset = makeDescriptor("box", info, "box"),
  base = buildHome(defaultLayout),
  anchors = Object.values(interactionAnchors(defaultLayout));
it("composes generic transformed obstacles without altering base world", () => {
  const original = JSON.stringify(base),
    // A clear bedroom foot-side corner, outside the restored kitchen doorway.
    p = { id: "p", assetId: "box", x: -4.2, z: -0.1, yaw: 1, scale: 1 };
  const result = composePlacements(base, [asset], [p], anchors);
  expect(result.error).toBeNull();
  expect(JSON.stringify(base)).toBe(original);
  const nav = createNavigation({
    ...result.world.bounds,
    obstacles: result.world.obstacles,
    clearance: 0.2,
    cellSize: result.world.navigationCellSize,
  });
  expect(nav.isWalkable([p.x, 0, p.z])).toBe(false);
  for (const a of anchors)
    expect(nav.findPath(base.spawn, a.position)).not.toBeNull();
});
it("rejects collisions, invalid scales and missing registry ids; decor does not block", () => {
  const p = { id: "p", assetId: "box", x: 1.18, z: -1.18, yaw: 0, scale: 1 };
  expect(composePlacements(base, [asset], [p], anchors).error).toBeTruthy();
  expect(
    composePlacements(base, [asset], [{ ...p, scale: NaN }], anchors).error,
  ).toBeTruthy();
  expect(composePlacements(base, [], [p], anchors).error).toBeTruthy();
  const result = composePlacements(
    base,
    [{ ...asset, collision: { strategy: "none" } }],
    [p],
    anchors,
  );
  expect(result.error).toBeNull();
  expect(result.world.obstacles).toHaveLength(base.obstacles.length);
});
it("resolves a reachable generic wardrobe approach at its placement", () => {
  const p = {
    id: "new-wardrobe",
    assetId: "box",
    x: 0,
    z: 0.8,
    yaw: 0,
    scale: 1,
  };
  const result = composePlacements(
    base,
    [{ ...asset, interaction: { kind: "wardrobe" } }],
    [p],
    anchors,
  );
  expect(result.error).toBeNull();
  expect(result.approaches[p.id]).toBeDefined();
});
