import { expect, it } from "vitest";
import { validateLayout, safeLayout } from "./layout";
import {
  defaultLayout,
  buildHome,
  interactionAnchors,
  floorPieces,
  homeScale,
} from "./xiyue";
import { createNavigation } from "../runtime/navigation";
import { createMotion } from "../runtime/motion";
import { studio } from "./studio";
import { mockProjectionProvider } from "../runtime/projections";
it("rejects obstructed, overlapping and out-of-room furniture without changing the default", () => {
  expect(validateLayout(defaultLayout)).toBeNull();
  expect(
    validateLayout({
      ...defaultLayout,
      sofa: { x: 0, z: 0, rotation: 0 },
      coffee: { x: 0, z: 0, rotation: 0 },
    }),
  ).not.toBeNull();
  expect(
    validateLayout({ ...defaultLayout, coffee: { x: 9, z: 0, rotation: 0 } }),
  ).not.toBeNull();
  expect(
    safeLayout({ ...defaultLayout, coffee: { x: 9, z: 0, rotation: 0 } }),
  ).toEqual(defaultLayout);
});
it("docks into the moved sofa then undocks and walks to the study", () => {
  const l = {
    sofa: { x: 1.1, z: -1.1, rotation: -Math.PI / 2 + 0.1 },
    coffee: { x: -0.8, z: -1.05, rotation: Math.PI / 2 },
  };
  const w = buildHome(l),
    a = interactionAnchors(l),
    nav = createNavigation({
      ...w.bounds,
      obstacles: w.obstacles,
      clearance: 0.2,
      cellSize: w.navigationCellSize,
    });
  const m = createMotion(w.spawn);
  m.setTarget(a.sofa_rest, nav.findPath(w.spawn, a.sofa_rest.position));
  for (let i = 0; i < 1800; i++) m.step(0.05, false);
  const docked = m.snapshot();
  expect(docked.arrived).toBe(true);
  expect(docked.position.map((v, i) => v + docked.dockOffset[i])).toEqual(
    a.sofa_rest.dock,
  );
  m.setTarget(a.desk_work, nav.findPath(docked.position, a.desk_work.position));
  for (let i = 0; i < 1800; i++) m.step(0.05, false);
  expect(m.snapshot().arrived).toBe(true);
  expect(m.snapshot().position).toEqual(a.desk_work.position);
  expect(m.snapshot().dockOffset).toEqual([0, 0, 0]);
});
it("keeps eight rooms within the requested approximate area and isolates Paperwood", () => {
  const area = floorPieces.reduce((n, r) => n + r.w * r.d, 0) * homeScale ** 2;
  expect(area).toBeGreaterThan(58);
  expect(area).toBeLessThan(65);
  const before = JSON.stringify(studio);
  buildHome(defaultLayout);
  expect(JSON.stringify(studio)).toBe(before);
  expect(buildHome(defaultLayout).id).not.toBe(studio.id);
});
it("projection provider returns independent read-only mock snapshots for each object", () => {
  for (const id of ["desk", "books", "journal"] as const) {
    const a = mockProjectionProvider.read("xiyue-home-v1", id);
    expect(a.entries.length).toBeGreaterThan(0);
    a.entries[0].text = "changed local copy";
    expect(
      mockProjectionProvider.read("xiyue-home-v1", id).entries[0].text,
    ).not.toBe("changed local copy");
  }
});
it("can retarget from points along a live route, including welded mesh corners", () => {
  const l = {
      sofa: { x: 1.1, z: -1.1, rotation: -Math.PI / 2 + 0.1 },
      coffee: { x: -0.8, z: -1.05, rotation: Math.PI / 2 },
    },
    w = buildHome(l),
    a = interactionAnchors(l);
  const nav = createNavigation({
      ...w.bounds,
      obstacles: w.obstacles,
      clearance: 0.2,
      cellSize: w.navigationCellSize,
    }),
    m = createMotion(w.spawn);
  m.setTarget(a.desk_work, nav.findPath(w.spawn, a.desk_work.position));
  const failures = [];
  for (let i = 0; i < 350; i++) {
    const f = m.step(0.05, false);
    if (i % 3 === 0 && !nav.findPath(f.position, a.kitchen_cook.position))
      failures.push(f.position);
  }
  expect(failures).toEqual([]);
});

it("rejects the former coffee-table position that blocks the restored kitchen entrance", () => {
  expect(
    validateLayout({
      ...defaultLayout,
      sofa: { x: 1.1, z: -1.1, rotation: -Math.PI / 2 + 0.1 },
      coffee: { x: 0.1, z: 0.8, rotation: Math.PI / 2 },
    }),
  ).not.toBeNull();
});
