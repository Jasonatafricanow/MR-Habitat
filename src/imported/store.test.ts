import "fake-indexeddb/auto";
import { expect, it } from "vitest";
import { AssetStore } from "./store";
import { makeDescriptor, instanceId } from "./descriptor";
const info = {
  bounds: {
    min: [0, 0, 0] as [number, number, number],
    max: [1, 1, 1] as [number, number, number],
  },
  meshes: 1,
  materials: 1,
  materialTypes: ["MeshStandardMaterial"],
  textures: 0,
  vertices: 36,
  triangles: 12,
  bytes: 3,
  animations: 0,
};
it("persists binary, descriptor and placements and atomically unregisters references", async () => {
  const name = "test-" + Math.random(),
    s = new AssetStore(name),
    a = makeDescriptor("Test", info, "unique");
  await s.add({ descriptor: a, blob: new Blob(["glb"]) });
  await expect(
    s.add({ descriptor: a, blob: new Blob(["other"]) }),
  ).rejects.toThrow();
  await s.savePlacements([
    { id: "placement", assetId: a.id, x: 1, z: 0, yaw: 1, scale: 1 },
  ]);
  const second = new AssetStore(name),
    snapshot = await second.read();
  expect(await snapshot.assets[0].blob.text()).toBe("glb");
  expect(snapshot.placements[0].yaw).toBe(1);
  expect(snapshot.instanceId).toBe(instanceId);
  await second.unregister(a.id);
  expect((await s.read()).assets).toEqual([]);
  expect((await s.read()).placements).toEqual([]);
});
it("does not save placements with missing assets", async () => {
  const s = new AssetStore("missing-" + Math.random());
  await expect(
    s.savePlacements([
      { id: "p", assetId: "absent", x: 0, z: 0, yaw: 0, scale: 1 },
    ]),
  ).rejects.toThrow();
  expect((await s.read()).placements).toEqual([]);
});
