import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DataTexture,
  Euler,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  RepeatWrapping,
  RGBAFormat,
  SphereGeometry,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type V3 = [number, number, number];
const colors = {
  oak: "#98734f",
  dark: "#503f30",
  edge: "#bd9a70",
  plaster: "#e3ddcb",
  cream: "#e9e1c9",
  linen: "#c9bfa6",
  moss: "#707c58",
  sage: "#919a7d",
  clay: "#b47558",
  leaf: "#506943",
  leafLight: "#849362",
  soil: "#3c352a",
  metal: "#39423e",
  brass: "#b69a60",
  tile: "#899a8c",
  grout: "#c6c5b3",
  stone: "#c3bda9",
  paper: "#f0e6ce",
  ink: "#7d7967",
  blue: "#839f9a",
  sky: "#bccfc6",
  mountain: "#8fa69e",
  mountainDark: "#708d82",
  water: "#a7beba",
  glass: "#c0d5c9",
  mirror: "#afc5bb",
  glow: "#ffe4ad",
  rug: "#bbb294",
  rust: "#96614b",
  // Architecture tones from the Xiyue moodboard: honey-oak boards, charcoal wall caps.
  floor: "#c49a6a",
  floorAlt: "#b98d5f",
  cap: "#33332f",
  plinth: "#d8cdb6",
  terracotta: "#b8673f",
  // Exterior: a lakeside mountain lot, kept to a short, fog-faded radius.
  grass: "#7e9f55",
  grassDark: "#6c8c4b",
  meadow: "#a3a86c",
  foliage: "#557a3e",
  foliageLight: "#7f9450",
  foliageDark: "#3d5a34",
  bark: "#5c4632",
  path: "#cbbfa6",
  sand: "#d6c7a2",
  lake: "#7fa2a3",
  hill: "#7d906a",
  ridge: "#8a9d93",
  ridgeFar: "#a9b8b6",
};
export type Mat = keyof typeof colors;

/** Small deterministic local textures: no network, full-screen effects or texture assets. */
function texture(kind: "wood" | "fabric") {
  const n = 128,
    data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const noise = ((x * 73 + y * 151 + x * y * 13) % 37) / 37;
      const v =
        kind === "wood"
          ? 222 +
            18 * Math.sin(y * 0.72 + Math.sin((x * Math.PI) / 64) * 2) +
            noise * 12
          : 228 + ((x + y) % 2) * 14 + noise * 9;
      const i = (y * n + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  const t = new DataTexture(data, n, n, RGBAFormat);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.colorSpace = SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}
export function createArtMaterials() {
  const wood = texture("wood"),
    fabric = texture("fabric");
  const materials = Object.fromEntries(
    Object.entries(colors).map(([key, color]) => [
      key,
      new MeshStandardMaterial({
        color,
        roughness:
          key === "metal" || key === "mirror"
            ? 0.35
            : key === "floor" || key === "floorAlt"
              ? 0.62
              : 0.88,
        metalness: key === "brass" ? 0.5 : key === "mirror" ? 0.4 : 0,
        map: ["oak", "dark", "edge", "floor", "floorAlt"].includes(key)
          ? wood
          : ["linen", "cream", "moss", "sage", "rug"].includes(key)
            ? fabric
            : null,
        ...(key === "glow"
          ? { emissive: new Color("#ffcf80"), emissiveIntensity: 0.65 }
          : {}),
        ...(key === "glass"
          ? {
              transparent: true,
              opacity: 0.16,
              depthWrite: false,
              roughness: 0.05,
            }
          : {}),
        ...(key === "lake" ? { roughness: 0.18, metalness: 0.1 } : {}),
      }),
    ]),
  ) as Record<Mat, MeshStandardMaterial>;
  return {
    materials,
    dispose: () => {
      Object.values(materials).forEach((m) => m.dispose());
      wood.dispose();
      fabric.dispose();
    },
  };
}

/** Bake each authored static assembly into one draw per material, preserving parent transforms. */
export class ArtBuilder {
  private inventory: Record<string, number> = {};
  note(kind: string) {
    this.inventory[kind] = (this.inventory[kind] ?? 0) + 1;
  }
  private matrix = new Matrix4();
  private batches = new Map<Mat, BufferGeometry[]>();
  box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: Mat = "oak",
    r = 0,
  ) {
    this.add(
      r
        ? new RoundedBoxGeometry(w, h, d, 1, Math.min(r, w / 3, h / 3, d / 3))
        : new BoxGeometry(w, h, d),
      [x, y, z],
      mat,
    );
  }
  cyl(
    x: number,
    y: number,
    z: number,
    radius: number,
    height: number,
    mat: Mat = "oak",
    top = radius,
  ) {
    this.add(new CylinderGeometry(top, radius, height, 12), [x, y, z], mat);
  }
  ball(x: number, y: number, z: number, scale: V3, mat: Mat) {
    this.add(new SphereGeometry(1, 12, 8).scale(...scale), [x, y, z], mat);
  }
  silhouette(points: [number, number][], z: number, mat: Mat) {
    const shape = new Shape();
    shape.moveTo(...points[0]);
    points.slice(1).forEach((p) => shape.lineTo(...p));
    shape.closePath();
    this.add(new ShapeGeometry(shape), [0, 0, z], mat);
  }
  ring(
    x: number,
    y: number,
    z: number,
    radius: number,
    tube: number,
    mat: Mat,
    rotate: V3 = [0, 0, 0],
  ) {
    this.at([x, y, z], rotate, () =>
      this.add(new TorusGeometry(radius, tube, 6, 20), [0, 0, 0], mat),
    );
  }
  at(position: V3, rotation: V3, draw: () => void) {
    const previous = this.matrix;
    this.matrix = previous
      .clone()
      .multiply(
        new Matrix4().compose(
          new Vector3(...position),
          new Quaternion().setFromEuler(new Euler(...rotation)),
          new Vector3(1, 1, 1),
        ),
      );
    draw();
    this.matrix = previous;
  }
  private add(source: BufferGeometry, p: V3, mat: Mat) {
    const g = source.index ? source.toNonIndexed() : source;
    if (g !== source) source.dispose();
    g.applyMatrix4(
      this.matrix.clone().multiply(new Matrix4().makeTranslation(...p)),
    );
    if (!this.batches.has(mat)) this.batches.set(mat, []);
    this.batches.get(mat)!.push(g);
  }
  finish(materials: Record<Mat, MeshStandardMaterial>, name: string) {
    const group = new Group();
    group.name = name;
    group.userData.inventory = { ...this.inventory };
    for (const [key, list] of this.batches) {
      const merged = mergeGeometries(list)!;
      list.forEach((g) => g.dispose());
      merged.computeBoundingSphere();
      const mesh = new Mesh(merged, materials[key]);
      mesh.name = `${name}:${key}`;
      mesh.castShadow = !["glass", "glow"].includes(key);
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    this.batches.clear();
    return group;
  }
}

export function cup(b: ArtBuilder, x: number, y: number, z: number) {
  b.note("cups");
  b.cyl(x, y + 0.066, z, 0.065, 0.13, "cream", 0.075);
  b.cyl(x, y + 0.133, z, 0.06, 0.008, "dark");
  b.ring(x + 0.086, y + 0.075, z, 0.042, 0.013, "cream");
  b.cyl(x, y + 0.008, z, 0.105, 0.016, "stone");
}
export function book(
  b: ArtBuilder,
  x: number,
  y: number,
  z: number,
  w = 0.24,
  d = 0.3,
  mat: Mat = "rust",
) {
  b.note("closedBooks");
  b.box(x, y + 0.025, z, w, 0.05, d, mat, 0.008);
  b.box(x + 0.006, y + 0.026, z + 0.006, w - 0.022, 0.029, d - 0.02, "paper");
}
export function openBook(b: ArtBuilder, x: number, y: number, z: number) {
  b.note("openBooks");
  for (const side of [-1, 1])
    b.at([x + side * 0.067, y + 0.018, z], [0, 0, side * 0.08], () => {
      b.box(0, 0, 0, 0.13, 0.025, 0.19, "moss", 0.006);
      b.box(0, 0.016, 0, 0.12, 0.008, 0.175, "paper");
      for (let i = 0; i < 5; i++)
        b.box(0, 0.021, -0.055 + i * 0.024, 0.08, 0.002, 0.003, "ink");
    });
}
export function plant(
  b: ArtBuilder,
  x: number,
  y: number,
  z: number,
  s = 1,
  habit: "broadleaf" | "herb" | "trailing" | "woody" = "broadleaf",
) {
  b.note("plants");
  b.cyl(x, y + s * 0.17, z, s * 0.16, s * 0.34, "clay", s * 0.21);
  b.cyl(x, y + s * 0.34, z, s * 0.215, s * 0.05, "clay");
  b.cyl(x, y + s * 0.368, z, s * 0.186, 0.01, "soil");
  if (habit === "trailing") {
    for (let stem = 0; stem < 3; stem++)
      for (let i = 0; i < 7; i++) {
        const dx = x + s * (stem - 1) * 0.13,
          dy = y + s * (0.45 - i * 0.16),
          dz = z + s * (0.2 + Math.sin(i) * 0.06);
        b.cyl(dx, dy, dz, 0.009, s * 0.19, "leaf");
        b.ball(
          dx + s * (i % 2 ? 0.07 : -0.07),
          dy,
          dz,
          [s * 0.1, s * 0.07, s * 0.028],
          "leaf",
        );
      }
    return;
  }
  if (habit === "woody") {
    b.cyl(x, y + s * 0.85, z, s * 0.025, s * 1.2, "dark", s * 0.012);
    for (let i = 0; i < 9; i++)
      b.at([x, y + s * (0.7 + i * 0.07), z], [0, i * 2.4, -0.65], () => {
        b.cyl(0, s * 0.15, 0, s * 0.009, s * 0.34, "oak");
        for (const t of [-1, 1])
          b.ball(
            t * s * 0.07,
            s * 0.29,
            0,
            [s * 0.09, s * 0.15, s * 0.03],
            i % 2 ? "leaf" : "leafLight",
          );
      });
    return;
  }
  if (habit === "herb") {
    for (let i = 0; i < 9; i++)
      b.at([x, y + s * 0.38, z], [0, i * 2.4, -0.35], () => {
        b.cyl(0, s * 0.15, 0, s * 0.01, s * 0.3, "leaf");
        for (const t of [-1, 1])
          b.ball(
            t * s * 0.06,
            s * (0.16 + (i % 3) * 0.04),
            0,
            [s * 0.1, s * 0.06, s * 0.028],
            "leafLight",
          );
      });
    return;
  }
  for (let i = 0; i < 7; i++)
    b.at([x, y + s * (0.43 + i * 0.035), z], [0, i * 2.4, -0.4], () => {
      b.cyl(0, s * 0.15, 0, s * 0.012, s * 0.4, "leaf");
      b.at([s * 0.11, s * 0.32, 0], [0, 0, -0.55], () =>
        b.ball(
          0,
          0,
          0,
          [s * 0.105, s * 0.26, s * 0.036],
          i % 2 ? "leaf" : "leafLight",
        ),
      );
    });
}
export function table(b: ArtBuilder, w: number, d: number, h = 0.76) {
  b.box(0, h, 0, w, 0.09, d, "oak", 0.025);
  b.box(0, h - 0.12, 0, w - 0.08, 0.14, d - 0.1, "dark");
  for (const x of [-1, 1])
    for (const z of [-1, 1])
      b.at(
        [x * (w / 2 - 0.065), 0, z * (d / 2 - 0.065)],
        [z * 0.035, 0, -x * 0.035],
        () => b.cyl(0, h / 2 - 0.03, 0, 0.03, h - 0.06, "oak", 0.04),
      );
}
export function rug(b: ArtBuilder, x: number, z: number, w: number, d: number) {
  b.box(x, 0.025, z, w, 0.035, d, "linen", 0.018);
  b.box(x, 0.046, z, w - 0.12, 0.008, d - 0.13, "rug");
  for (const s of [-1, 1]) {
    b.box(x, 0.052, z + s * (d / 2 - 0.16), w - 0.1, 0.008, 0.025, "dark");
    for (let i = 0; i < Math.floor(w / 0.085); i++)
      b.box(
        x - w / 2 + 0.045 + i * 0.085,
        0.027,
        z + (s * d) / 2,
        0.025,
        0.016,
        0.12,
        "linen",
      );
  }
}
export function lamp(b: ArtBuilder, x: number, y: number, z: number, h = 0.48) {
  b.cyl(x, y + 0.025, z, h * 0.22, 0.05, "dark");
  b.cyl(x, y + h * 0.48, z, 0.018, h * 0.85, "brass");
  b.cyl(x, y + h * 0.83, z, h * 0.33, h * 0.4, "glow", h * 0.2);
}
