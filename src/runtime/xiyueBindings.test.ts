import { expect, it } from "vitest";
import { authoredInspectionSites } from "../worlds/xiyueSites";
import { props, buildHome, defaultLayout } from "../worlds/xiyue";
import {
  resolveProjectionBindings,
  xiyueProjectionBindings,
} from "./xiyueBindings";

it("binds journal to the existing study notebook and never creates a host for missing bindings", () => {
  const sites = authoredInspectionSites(props);
  const views = resolveProjectionBindings(sites, xiyueProjectionBindings);
  expect(views.find((v) => v.objectId === "journal")?.hostId).toBe("desk");
  expect(views.some((v) => v.hostId.includes("entry"))).toBe(false);
  expect(resolveProjectionBindings(sites, {})).toEqual([]);
  expect(
    resolveProjectionBindings(sites, { "missing-site": "journal" }),
  ).toEqual([]);
});
it("projection mappings follow authored sites without mutating furniture, navigation or geometry coordinates", () => {
  const before = JSON.stringify({ props, world: buildHome(defaultLayout) });
  const moved = props.map((p) =>
    p.id === "desk" ? { ...p, x: p.x - 0.1 } : { ...p },
  );
  const original = resolveProjectionBindings(
    authoredInspectionSites(props),
    xiyueProjectionBindings,
  );
  const changed = resolveProjectionBindings(
    authoredInspectionSites(moved),
    xiyueProjectionBindings,
  );
  expect(
    changed.find((v) => v.objectId === "journal")!.position[0],
  ).toBeCloseTo(
    original.find((v) => v.objectId === "journal")!.position[0] - 0.1,
  );
  resolveProjectionBindings(authoredInspectionSites(props), {
    "desk-notebook": "books",
  });
  expect(JSON.stringify({ props, world: buildHome(defaultLayout) })).toBe(
    before,
  );
});
