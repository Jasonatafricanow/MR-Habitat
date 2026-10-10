import { expect, it } from "vitest";
import {
  defaultLayout,
  buildHome,
  interactionAnchors,
  encodeLayout,
  decodeLayout,
  furnitureObstacle,
} from "./xiyue";
import { createNavigation } from "../runtime/navigation";
import { outfits, chooseOutfit } from "../runtime/wardrobe";
it("connects all rooms and activities in default and moved layouts", () => {
  for (const layout of [
    defaultLayout,
    {
      ...defaultLayout,
      sofa: { x: 1.1, z: -1.1, rotation: -Math.PI / 2 + 0.1 },
      coffee: { x: -0.8, z: -1.05, rotation: Math.PI / 2 },
    },
  ]) {
    const world = buildHome(layout);
    const nav = createNavigation({
      ...world.bounds,
      obstacles: world.obstacles,
      clearance: 0.2,
      cellSize: world.navigationCellSize,
    });
    const points = [
      world.spawn,
      ...Object.values(interactionAnchors(layout)).map((a) => a.position),
    ];
    for (const a of points)
      for (const b of points)
        expect(nav.findPath(a, b), `${a} -> ${b}`).not.toBeNull();
  }
});
it("stores independent transforms and derives rotated obstacles without mutating shell", () => {
  const original = JSON.stringify(buildHome(defaultLayout));
  const moved = {
    ...defaultLayout,
    coffee: { x: 0, z: -1, rotation: Math.PI / 2 },
  };
  expect(decodeLayout(encodeLayout(moved))).toEqual(moved);
  expect(furnitureObstacle("coffee", moved.coffee)).not.toEqual(
    furnitureObstacle("coffee", defaultLayout.coffee),
  );
  expect(JSON.stringify(buildHome(defaultLayout))).toBe(original);
  expect(decodeLayout("{broken")).toEqual(defaultLayout);
  expect(
    decodeLayout(JSON.stringify({ worldId: "paperwood", props: moved })),
  ).toEqual(defaultLayout);
});
it("agent chooses an existing full outfit, avoiding current selection", () => {
  for (const night of [true, false])
    for (const current of outfits) {
      const choice = chooseOutfit(current.id, night);
      expect(outfits).toContain(choice);
      expect(choice.id).not.toBe(current.id);
    }
});
