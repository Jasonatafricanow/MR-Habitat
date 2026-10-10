import { Box3, LoadingManager, Mesh, Texture, type Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ModelInfo, Vec3 } from "./descriptor";
export const maxGlbBytes = 32 * 1024 * 1024;
export function checkContainer(raw: ArrayBuffer) {
  if (raw.byteLength < 20 || raw.byteLength > maxGlbBytes)
    throw new Error("GLB 文件无效或超过 32 MB 限制");
  const v = new DataView(raw);
  if (
    v.getUint32(0, true) !== 0x46546c67 ||
    v.getUint32(4, true) !== 2 ||
    v.getUint32(8, true) !== raw.byteLength
  )
    throw new Error("不是有效的 GLB 2.0 文件");
  let offset = 12,
    doc: any;
  while (offset < raw.byteLength) {
    if (offset + 8 > raw.byteLength) throw new Error("GLB 分块损坏");
    const length = v.getUint32(offset, true),
      kind = v.getUint32(offset + 4, true);
    if (length % 4 || offset + 8 + length > raw.byteLength)
      throw new Error("GLB 分块长度错误");
    if (offset === 12) {
      if (kind !== 0x4e4f534a) throw new Error("GLB 缺少 JSON");
      try {
        doc = JSON.parse(
          new TextDecoder().decode(raw.slice(offset + 8, offset + 8 + length)),
        );
      } catch {
        throw new Error("GLB JSON 损坏");
      }
    }
    offset += 8 + length;
  }
  if (!doc || doc.asset?.version !== "2.0") throw new Error("仅支持 GLB 2.0");
  if (
    [...(doc.buffers ?? []), ...(doc.images ?? [])].some(
      (r: any) => r.uri && !r.uri.startsWith("data:"),
    )
  )
    throw new Error("GLB 包含外部文件；请导出所有贴图内嵌的 GLB");
  if (
    (doc.extensionsRequired ?? []).some((e: string) =>
      [
        "KHR_draco_mesh_compression",
        "EXT_meshopt_compression",
        "KHR_texture_basisu",
      ].includes(e),
    )
  )
    throw new Error(
      "V0 暂不支持 Draco / Meshopt / KTX2 压缩，请导出未压缩 GLB",
    );
  if (
    (doc.accessors ?? []).some(
      (a: any) =>
        !Number.isInteger(a.count) || a.count < 0 || a.count > 2000000,
    ) ||
    (doc.nodes ?? []).length > 4096
  )
    throw new Error("模型复杂度超过 V0 限制");
  return doc;
}
export async function inspectGlb(
  raw: ArrayBuffer,
): Promise<{ scene: Object3D; info: ModelInfo }> {
  checkContainer(raw);
  const manager = new LoadingManager();
  manager.setURLModifier((url) => {
    if (!url.startsWith("blob:") && !url.startsWith("data:"))
      throw new Error("禁止加载 GLB 外部资源");
    return url;
  });
  let gltf;
  try {
    gltf = await new GLTFLoader(manager).parseAsync(raw, "");
  } catch (e) {
    throw new Error(
      "无法解析 GLB：" + (e instanceof Error ? e.message : String(e)),
    );
  }
  try {
    const scene = gltf.scene;
    scene.updateMatrixWorld(true);
    let meshes = 0,
      vertices = 0,
      triangles = 0;
    const materials = new Set<any>(),
      textures = new Set<Texture>();
    const lights: Object3D[] = [];
    scene.traverse((o) => {
      if ("isLight" in o) lights.push(o);
      if (!(o instanceof Mesh)) return;
      meshes++;
      const pos = o.geometry.getAttribute("position");
      if (!pos) throw new Error("网格缺少顶点");
      const instances =
        "isInstancedMesh" in o ? (o as Mesh & { count: number }).count : 1;
      vertices += pos.count * instances;
      const index = o.geometry.index;
      if (index)
        for (let i = 0; i < index.count; i++) {
          const n = index.getX(i);
          if (!Number.isInteger(n) || n < 0 || n >= pos.count)
            throw new Error("网格索引越界");
        }
      triangles += ((o.geometry.index?.count ?? pos.count) / 3) * instances;
      for (let i = 0; i < pos.count; i++)
        if (![pos.getX(i), pos.getY(i), pos.getZ(i)].every(Number.isFinite))
          throw new Error("网格含无效顶点");
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        materials.add(m);
        Object.values(m).forEach((t) => {
          if (t instanceof Texture) textures.add(t);
        });
      }
      o.castShadow = true;
      o.receiveShadow = true;
    });
    lights.forEach((light) => light.removeFromParent());
    if (!meshes || !triangles) throw new Error("GLB 没有可显示的 mesh 网格");
    if (meshes > 2048 || vertices > 2000000 || triangles > 1000000)
      throw new Error("模型过于复杂（上限 200 万顶点 / 100 万三角面）");
    const box = new Box3().setFromObject(scene, true),
      min = box.min.toArray() as Vec3,
      max = box.max.toArray() as Vec3;
    if (
      ![...min, ...max].every(Number.isFinite) ||
      max.some((n, i) => n - min[i] > 10000) ||
      Math.max(...max.map((n, i) => n - min[i])) <= 0
    )
      throw new Error("模型包围盒无效或尺寸过大");
    return {
      scene,
      info: {
        bounds: { min, max },
        meshes,
        vertices,
        triangles: Math.round(triangles),
        materials: materials.size,
        materialTypes: [
          ...new Set(
            [...materials].map((m) =>
              m.isMeshBasicMaterial ? "unlit" : "PBR metallic-roughness",
            ),
          ),
        ],
        textures: textures.size,
        bytes: raw.byteLength,
        animations: gltf.animations.length,
      },
    };
  } catch (e) {
    disposeModel(gltf.scene);
    throw e;
  }
}
export function disposeModel(scene: Object3D) {
  const materials = new Set<any>(),
    textures = new Set<Texture>();
  scene.traverse((o) => {
    if (o instanceof Mesh) {
      o.geometry.dispose();
      for (const m of Array.isArray(o.material) ? o.material : [o.material])
        materials.add(m);
    }
  });
  for (const m of materials) {
    Object.values(m).forEach((t) => {
      if (t instanceof Texture) textures.add(t);
    });
    m.dispose();
  }
  textures.forEach((t) => t.dispose());
}
