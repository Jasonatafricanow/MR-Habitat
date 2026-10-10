import { floorPieces, walls } from "../worlds/xiyue";
import { ArtBuilder, plant, rug } from "./xiyueGeometry";

export const wallHeight = 2.65;
/** Sims-style "walls cutaway" height for walls that face the camera. */
export const cutHeight = 0.55;

type Wall = (typeof walls)[number];
/** Window openings, in wall-plan coordinates (centre along the wall line). */
const openings = [
  { x: -3.3, z: -3.6, width: 2.38, sill: 1.0, head: 2.43 },
  { x: 3.6, z: -3.6, width: 1.55, sill: 1.0, head: 2.43 },
  { x: 2.6, z: 3.75, width: 0.62, sill: 1.45, head: 2.15 },
  { x: 1.42, z: 4.2, width: 0.9, sill: 1.25, head: 2.05 },
  { x: -5, z: 1.55, width: 0.6, sill: 1.65, head: 2.15 },
];
const alongX = (v: Wall) => v[2] >= v[3];

function distanceToWall(v: Wall, x: number, z: number) {
  const dx = Math.max(Math.abs(x - v[0]) - v[2] / 2, 0);
  const dz = Math.max(Math.abs(z - v[1]) - v[3] / 2, 0);
  return Math.hypot(dx, dz);
}
/** The wall an attachment hangs on: nearest segment, so door frames in gaps follow their wall line. */
export function wallOwner(x: number, z: number) {
  let best = 0;
  for (let i = 1; i < walls.length; i++)
    if (distanceToWall(walls[i], x, z) < distanceToWall(walls[best], x, z))
      best = i;
  return best;
}

/** Wall body with real openings so the exterior is visible through the glass. */
function wallBody(b: ArtBuilder, v: Wall, h: number, full: boolean) {
  const mat = v[0] === -5 && v[1] === 1.8 ? "tile" : "plaster";
  const x = alongX(v);
  const len = x ? v[2] : v[3];
  const start = (x ? v[0] : v[1]) - len / 2;
  const holes = full
    ? openings
        .filter((o) =>
          x
            ? Math.abs(o.z - v[1]) < 0.01 && Math.abs(o.x - v[0]) < v[2] / 2
            : Math.abs(o.x - v[0]) < 0.01 && Math.abs(o.z - v[1]) < v[3] / 2,
        )
        .map((o) => ({ ...o, c: x ? o.x : o.z }))
        .sort((p, q) => p.c - q.c)
    : [];
  const piece = (a: number, end: number, y0: number, y1: number) => {
    if (end - a < 0.001 || y1 - y0 < 0.001) return;
    const c = (a + end) / 2;
    if (x) b.box(c, (y0 + y1) / 2, v[1], end - a, y1 - y0, v[3], mat);
    else b.box(v[0], (y0 + y1) / 2, c, v[2], y1 - y0, end - a, mat);
  };
  let cursor = start;
  for (const o of holes) {
    const l = o.c - o.width / 2,
      r = o.c + o.width / 2;
    piece(cursor, l, 0, h);
    piece(l, r, 0, o.sill);
    piece(l, r, o.head, h);
    cursor = r;
  }
  piece(cursor, start + len, 0, h);
  b.box(v[0], h + 0.03, v[1], v[2] + 0.05, 0.06, v[3] + 0.05, "cap", 0.012);
  b.box(v[0], 0.07, v[1], v[2] + 0.028, 0.14, v[3] + 0.028, "cream");
  if (full)
    b.box(v[0], h - 0.05, v[1], v[2] + 0.04, 0.07, v[3] + 0.04, "cream");
}

function windowUnit(b: ArtBuilder, w: number, h: number, dressed: boolean) {
  // Local +z faces the room. Frame, mullions and glass sit in the opening.
  for (const side of [-1, 1]) {
    b.box((side * (w + 0.06)) / 2, 0, 0, 0.06, h + 0.06, 0.2, "edge");
    b.box(0, (side * (h + 0.06)) / 2, 0, w + 0.12, 0.06, 0.2, "edge");
  }
  b.box(0, 0, 0, w, h, 0.012, "glass");
  for (const x of w > 1 ? [-w / 6, w / 6] : [0])
    b.box(x, 0, 0, 0.035, h, 0.05, "edge");
  b.box(0, h * 0.12, 0, w, 0.035, 0.05, "edge");
  b.box(0, -h / 2 - 0.05, 0.13, w + 0.2, 0.05, 0.22, "oak", 0.012);
  b.box(0, -h / 2 - 0.05, -0.12, w + 0.16, 0.04, 0.16, "stone", 0.01);
  if (!dressed) return;
  for (let i = 0; i < 7; i++)
    b.at([0, h / 2 - 0.025 - i * 0.058, 0.16], [0.2, 0, 0], () =>
      b.box(0, 0, 0, w - 0.04, 0.026, 0.055, "oak"),
    );
  for (const x of [-w * 0.32, w * 0.32])
    b.box(x, h / 2 - 0.19, 0.19, 0.01, 0.42, 0.009, "linen");
  b.box(0, h / 2 + 0.13, 0.2, w + 0.45, 0.04, 0.045, "brass");
  for (const s of [-1, 1])
    for (let i = 0; i < 4; i++)
      b.cyl(
        s * (w / 2 + 0.08) + (i - 1.5) * 0.046,
        -0.08,
        0.2,
        0.038,
        h + 0.27,
        "cream",
      );
}

/** Floors, plinth, thresholds and the low balcony rail: never cut away. */
export function floors(b: ArtBuilder) {
  for (const r of floorPieces) {
    b.box(r.x, -0.135, r.z, r.w, 0.27, r.d, "plinth");
    const tiled = ["bathroom", "kitchen", "balcony"].includes(r.id);
    if (tiled) {
      const rows = Math.ceil(r.d / 0.42),
        cols = Math.ceil(r.w / 0.42);
      const tw = r.w / cols,
        td = r.d / rows;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++)
          b.box(
            r.x - r.w / 2 + (i + 0.5) * tw,
            0.002,
            r.z - r.d / 2 + (j + 0.5) * td,
            tw - 0.009,
            0.024,
            td - 0.008,
            (i + j) % 3 ? "stone" : "grout",
          );
      continue;
    }
    // Long honey-oak boards with staggered butt joints, as in the moodboard floors.
    const rows = Math.ceil(r.d / 0.2),
      td = r.d / rows;
    for (let j = 0; j < rows; j++) {
      const z = r.z - r.d / 2 + (j + 0.5) * td;
      const joints = [r.x - r.w / 2];
      for (
        let x = joints[0] + 0.55 + ((j * 0.37) % 0.6);
        x < r.x + r.w / 2 - 0.3;
        x += 1.1 + ((j * 0.23) % 0.5)
      )
        joints.push(x);
      joints.push(r.x + r.w / 2);
      for (let i = 0; i < joints.length - 1; i++)
        b.box(
          (joints[i] + joints[i + 1]) / 2,
          0.002,
          z,
          joints[i + 1] - joints[i] - 0.006,
          0.024,
          td - 0.006,
          (i + j * 2) % 3 === 0 ? "floorAlt" : "floor",
        );
    }
  }
  for (const [x, z, width, rot] of [
    [-1.6, -0.3, 1, Math.PI / 2],
    [-2.8, 1.45, 0.9, Math.PI / 2],
    [0.76, 1.2, 1.38, 0],
    [-0.9, 4.2, 1, 0],
  ])
    b.at([x, 0, z], [0, rot, 0], () =>
      b.box(0, 0.025, 0, width, 0.025, 0.18, "stone"),
    );
  b.box(0, 0.94, -4.37, 3.2, 0.065, 0.07, "dark", 0.014);
  for (let i = 0; i <= 16; i++)
    b.box(-1.54 + i * 0.192, 0.65, -4.37, 0.025, 0.55, 0.025, "metal");
}

/** Everything mounted on a wall; `on(x, z)` is the builder of the wall that owns the point. */
function mounted(on: (x: number, z: number) => ArtBuilder) {
  let b = on(-3.3, -3.6);
  b.at([-3.3, 1.715, -3.6], [0, 0, 0], () => windowUnit(b, 2.38, 1.43, true));
  b = on(3.6, -3.6);
  b.at([3.6, 1.715, -3.6], [0, 0, 0], () => {
    windowUnit(b, 1.55, 1.43, true);
    plant(b, -1.55 * 0.28, -1.43 / 2 - 0.025, 0.16, 0.42, "herb");
  });
  b = on(2.6, 3.75);
  b.at([2.6, 1.8, 3.75], [0, -Math.PI / 2, 0], () => {
    windowUnit(b, 0.62, 0.7, false);
    plant(b, -0.62 * 0.28, -0.35 - 0.025, 0.16, 0.42, "herb");
  });
  b = on(1.42, 4.2);
  b.at([1.42, 1.65, 4.2], [0, Math.PI, 0], () =>
    windowUnit(b, 0.9, 0.8, false),
  );
  b = on(-5, 1.55);
  b.at([-5, 1.9, 1.55], [0, Math.PI / 2, 0], () =>
    windowUnit(b, 0.6, 0.5, false),
  );

  const doorFrame = (x: number, z: number, width: number, rotation: number) => {
    const w = on(x, z);
    w.at([x, 0, z], [0, rotation, 0], () => {
      for (const side of [-1, 1])
        w.box((side * width) / 2, 1.08, 0, 0.06, 2.16, 0.18, "oak");
      w.box(0, 2.18, 0, width + 0.06, 0.08, 0.18, "oak");
    });
    return w;
  };
  doorFrame(-1.6, -0.3, 1, Math.PI / 2);
  doorFrame(-2.8, 1.45, 0.9, Math.PI / 2);
  doorFrame(0.76, 1.2, 1.38, 0);
  b = doorFrame(-0.9, 4.2, 1, 0);
  b.note("entryDoors");
  b.box(-0.9, 1.04, 4.2, 0.92, 2.08, 0.065, "oak", 0.015);
  for (const y of [0.54, 1.54])
    for (const z of [4.161, 4.239])
      b.box(-0.9, y, z, 0.73, 0.84, 0.012, "edge", 0.015);
  for (const z of [4.12, 4.28]) b.box(-0.54, 1, z, 0.11, 0.027, 0.04, "brass");

  b = on(0.04, -2.8);
  for (const x of [-0.76, 0.84])
    b.box(x, 1.22, -2.79, 0.055, 2.4, 0.075, "dark");
  b.box(0.04, 2.43, -2.79, 1.66, 0.075, 0.08, "dark");
  b.box(-0.55, 1.23, -2.8, 0.34, 2.28, 0.017, "glass");

  b = on(-1.35, 2.085);
  b.at([-1.35, 1.48, 2.085], [0, 0, 0], () => {
    b.ball(0, 0, 0, [0.28, 0.46, 0.026], "dark");
    b.ball(0, 0, 0.024, [0.245, 0.423, 0.012], "mirror");
  });
  // The close-up places hooks on the kitchen partition, across from the mirror.
  b = on(-0.085, 2.48);
  b.at([-0.085, 1.48, 2.48], [0, -Math.PI / 2, 0], () => {
    b.box(0, 0.03, 0, 0.09, 0.56, 0.035, "oak");
    b.ball(0, 0.25, 0.044, [0.024, 0.024, 0.04], "brass");
    b.box(0, -0.1, 0.053, 0.13, 0.62, 0.06, "rust", 0.028);
    b.ring(0.35, -0.03, 0.03, 0.07, 0.012, "dark");
    b.box(0.35, -0.19, 0.06, 0.17, 0.25, 0.095, "linen", 0.04);
  });
  b = on(5.248, 0.26);
  b.at([5.248, 1.66, 0.26], [0, -Math.PI / 2, 0], () => {
    b.box(0, 0, 0, 1.38, 0.88, 0.055, "dark", 0.015);
    b.box(0, 0, 0.033, 1.3, 0.8, 0.018, "edge");
    for (let i = 0; i < 6; i++)
      b.at(
        [-0.45 + (i % 3) * 0.42, i < 3 ? 0.18 : -0.18, 0.05],
        [0, 0, (i - 3) * 0.035],
        () => {
          b.box(0, 0, 0, 0.28, 0.28, 0.005, i === 2 ? "blue" : "paper");
          b.ball(0, 0.11, 0.01, [0.013, 0.013, 0.009], "clay");
          for (let j = 0; j < 3; j++)
            b.box(0, 0.04 - j * 0.044, 0.004, 0.17, 0.008, 0.003, "ink");
        },
      );
    b.box(0, 0.63, 0.09, 1.6, 0.055, 0.27, "oak");
    for (let i = 0; i < 9; i++)
      b.box(
        -0.61 + i * 0.095,
        0.79,
        0.07,
        0.06,
        0.27 + (i % 3) * 0.025,
        0.16,
        i % 2 ? "moss" : "linen",
        0.004,
      );
  });
  b = on(2.49, 2.75);
  b.at([2.49, 1.58, 2.75], [0, -Math.PI / 2, 0], () => {
    for (const y of [0.02, 0.45]) {
      b.box(0, y, 0.07, 1.45, 0.055, 0.3, "oak", 0.01);
      for (let i = 0; i < 3; i++) {
        const jarHeight = [0.2, 0.27, 0.18][i];
        b.cyl(
          -0.46 + i * 0.45,
          y + 0.03 + jarHeight / 2,
          0.1,
          0.067,
          jarHeight,
          i % 3 ? "cream" : "clay",
        );
        b.cyl(
          -0.46 + i * 0.45,
          y + 0.043 + jarHeight,
          0.1,
          0.072,
          0.025,
          "dark",
        );
        b.box(-0.46 + i * 0.45, y + 0.13, 0.17, 0.07, 0.075, 0.005, "paper");
      }
    }
    b.box(0, -0.18, 0.075, 1.92, 0.025, 0.025, "brass");
    for (let i = 0; i < 4; i++) {
      b.box(-0.72 + i * 0.37, -0.33, 0.08, 0.035, 0.29, 0.025, "dark", 0.01);
      b.at([-0.72 + i * 0.37, -0.52, 0.09], [Math.PI / 2, 0, 0], () =>
        b.cyl(0, 0, 0, i < 2 ? 0.13 : 0.06, 0.035, i < 2 ? "metal" : "oak"),
      );
    }
  });
  b = on(-3.45, 0.49);
  b.at([-3.45, 1.43, 0.49], [0, 0, 0], () => {
    // Tile and mirror are flush with the actual bedroom/bath shared wall, not a detached backing.
    b.box(0, 0.02, -0.025, 1.05, 1.05, 0.025, "tile");
    b.ring(0, 0.02, 0.024, 0.35, 0.028, "glow");
    b.ball(0, 0.02, 0.02, [0.328, 0.328, 0.013], "mirror");
    b.box(0.49, -0.08, 0.16, 0.036, 0.025, 0.24, "brass");
    b.box(0.49, -0.32, 0.16, 0.055, 0.47, 0.25, "linen", 0.015);
  });
  b = on(-4.72, -3.51);
  b.at([-4.72, 1.78, -3.51], [0, 0, 0], () => {
    b.box(0, 0, 0, 0.35, 0.56, 0.055, "oak");
    b.box(0, 0, 0.035, 0.29, 0.5, 0.008, "paper");
    b.ball(0, 0.01, 0.043, [0.13, 0.21, 0.004], "sage");
    b.box(0, -0.08, 0.05, 0.014, 0.32, 0.004, "dark");
  });
  for (let j = 0; j < 5; j++)
    for (let i = 0; i < 8; i++)
      on(2.499, 1.7 + i * 0.31).box(
        2.499,
        0.92 + j * 0.13,
        1.7 + i * 0.31,
        0.009,
        0.121,
        0.298,
        (i + j) % 3 ? "tile" : "sage",
      );
  for (let i = 0; i < 7; i++)
    on(-4.914, 0.58 + i * 0.37).box(
      -4.914,
      0.25,
      0.58 + i * 0.37,
      0.01,
      0.28,
      0.36,
      "tile",
    );
}

/** Balcony parapets keep one low height from every angle. */
function parapetHeight(v: Wall) {
  if (v[1] === -4.4) return 0.375;
  if (Math.abs(v[0]) === 1.6 && v[1] === -3.6) return 0.95;
  return null;
}

/**
 * Walls cutaway rule: a wall drops when the camera is on one side of it and
 * the other side is indoors, i.e. it would hide a room. Exterior walls at the
 * back keep full height. `cx, cz` is the camera's horizontal view direction
 * (camera minus target, normalised).
 */
export function cutsAway(v: Wall, cx: number, cz: number) {
  const along = alongX(v) ? cz : cx;
  if (Math.abs(along) < 0.3) return false;
  const s = Math.sign(along);
  const px = alongX(v) ? v[0] : v[0] - s * 0.35;
  const pz = alongX(v) ? v[1] - s * 0.35 : v[1];
  return floorPieces.some(
    (r) => Math.abs(px - r.x) <= r.w / 2 && Math.abs(pz - r.z) <= r.d / 2,
  );
}

export type WallDraw = {
  /** Wall-plan rectangle [x, z, w, d]. */
  rect: Wall;
  full: ArtBuilder;
  cut: ArtBuilder;
};
/** One full-height and one cutaway builder per wall segment. */
export function wallAssemblies(): WallDraw[] {
  const out = walls.map((rect) => ({
    rect,
    full: new ArtBuilder(),
    cut: new ArtBuilder(),
  }));
  for (const w of out) {
    const low = parapetHeight(w.rect);
    wallBody(w.full, w.rect, low ?? wallHeight, low === null);
    wallBody(w.cut, w.rect, low ?? cutHeight, false);
  }
  mounted((x, z) => out[wallOwner(x, z)].full);
  return out;
}

/** Floor-standing room details; wall-mounted items live with their wall. */
export function decorations(b: ArtBuilder) {
  rug(b, 0.02, -0.65, 2.5, 2.8);
  rug(b, -0.86, 3.35, 0.75, 1.1);
  rug(b, 3.68, -2.43, 1.36, 1.54);
  rug(b, -3.77, -1.5, 2.66, 2.04);
  rug(b, -3.56, 2.08, 0.83, 0.52);
  rug(b, 1.25, 3.06, 0.68, 1.04);
  plant(b, -4.61, 0, -3.11, 0.72);
  plant(b, 4.85, 0.815, -0.14, 0.35);
  plant(b, -4.78, 0.64, 1.84, 0.42);
  b.box(-4.79, 0.61, 1.84, 0.22, 0.05, 0.4, "oak");
}
