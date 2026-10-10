import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { inspectGlb } from "./glb";
import { makeDescriptor, footprint, normalOffset } from "./descriptor";
it("parses a real GLB and reports geometry, materials, bytes and raw off-center bounds", async () => {
  const raw = readFileSync("public/fixtures/crate.glb");
  const result = await inspectGlb(
    raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength),
  );
  expect(result.info.meshes).toBe(1);
  expect(result.info.triangles).toBe(12);
  expect(result.info.materials).toBe(1);
  expect(result.info.bytes).toBe(raw.length);
  expect(result.info.bounds.min[1]).toBeGreaterThan(0);
  const d = makeDescriptor("crate", result.info, "asset-one");
  expect(JSON.parse(JSON.stringify(d))).toEqual(d);
  expect(normalOffset(result.info.bounds, true)[1]).toBe(
    -result.info.bounds.min[1],
  );
  const p = { id: "p", assetId: d.id, x: 0, z: 0, yaw: Math.PI / 2, scale: 2 };
  const box = footprint(d, p);
  expect(box.maxX - box.minX).toBeCloseTo(0.8);
  expect(box.maxZ - box.minZ).toBeCloseTo(1);
});
it("rejects malformed GLB and files without geometry clearly", async () => {
  await expect(inspectGlb(new ArrayBuffer(20))).rejects.toThrow();
  const raw = readFileSync("public/fixtures/empty.glb");
  await expect(
    inspectGlb(
      raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength),
    ),
  ).rejects.toThrow(/mesh|模型|网格/);
});
it("rejects external resources and compressed dependencies before loading", async () => {
  function glb(doc: unknown) {
    const bytes = new TextEncoder().encode(JSON.stringify(doc));
    const n = Math.ceil(bytes.length / 4) * 4,
      raw = new ArrayBuffer(20 + n),
      v = new DataView(raw);
    v.setUint32(0, 0x46546c67, true);
    v.setUint32(4, 2, true);
    v.setUint32(8, raw.byteLength, true);
    v.setUint32(12, n, true);
    v.setUint32(16, 0x4e4f534a, true);
    new Uint8Array(raw, 20).fill(32);
    new Uint8Array(raw, 20, bytes.length).set(bytes);
    return raw;
  }
  await expect(
    inspectGlb(
      glb({
        asset: { version: "2.0" },
        images: [{ uri: "https://example.invalid/texture.png" }],
      }),
    ),
  ).rejects.toThrow(/外部/);
  await expect(
    inspectGlb(
      glb({
        asset: { version: "2.0" },
        extensionsRequired: ["KHR_draco_mesh_compression"],
      }),
    ),
  ).rejects.toThrow(/压缩/);
});
