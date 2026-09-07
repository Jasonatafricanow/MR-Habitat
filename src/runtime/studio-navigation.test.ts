import { expect, it } from "vitest";
import { studio } from "../worlds/studio";
import { createNavigation } from "./navigation";

it("connects every authored activity anchor without crossing the studio furniture", () => {
  const navigation = createNavigation({
    ...studio.bounds,
    obstacles: studio.obstacles,
    clearance: 0.2,
  });
  const anchors = [
    studio.spawn,
    ...Object.values(studio.anchors).map((anchor) => anchor.position),
  ];
  for (const start of anchors)
    for (const end of anchors) {
      const route = navigation.findPath(start, end);
      expect(route, `route from ${start} to ${end}`).not.toBeNull();
      expect(route!.at(-1)).toEqual(end);
      let previous = start;
      const collisions: Array<{ x: number; z: number }> = [];
      for (const point of route!) {
        for (let step = 0; step <= 100; step++) {
          const t = step / 100;
          const x = previous[0] * (1 - t) + point[0] * t;
          const z = previous[2] * (1 - t) + point[2] * t;
          for (const rect of studio.obstacles) {
            if (
              x > rect.minX - 0.2 &&
              x < rect.maxX + 0.2 &&
              z > rect.minZ - 0.2 &&
              z < rect.maxZ + 0.2
            )
              collisions.push({ x, z });
          }
        }
        previous = point;
      }
      expect(collisions, `clearance on route ${start} to ${end}`).toEqual([]);
    }
});
