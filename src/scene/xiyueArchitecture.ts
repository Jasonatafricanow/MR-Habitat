import { floorPieces, walls } from "../worlds/xiyue";
import { ArtBuilder, plant, rug } from "./xiyueGeometry";

function windowView(
  b: ArtBuilder,
  w: number,
  h: number,
  curtains = true,
  planted = false,
) {
  b.box(0, 0, 0, w + 0.15, h + 0.15, 0.09, "dark");
  b.box(0, 0, 0.055, w, h, 0.018, "sky");
  b.ball(w * 0.27, h * 0.29, 0.074, [0.11, 0.11, 0.006], "glow");
  for (let i = 0; i < 5; i++)
    b.ball(
      -w * 0.36 + i * w * 0.18,
      -h * 0.23,
      0.083 + i * 0.003,
      [w * 0.23, h * (0.2 + (i % 3) * 0.07), 0.012],
      i % 2 ? "mountain" : "mountainDark",
    );
  b.box(0, -h * 0.39, 0.106, w, h * 0.22, 0.015, "water");
  for (const x of [-w / 2, 0, w / 2])
    b.box(x, 0, 0.14, 0.045, h + 0.07, 0.09, "edge", 0.008);
  for (const y of [-h / 2, h / 2])
    b.box(0, y, 0.14, w + 0.09, 0.045, 0.09, "edge");
  b.box(0, -h / 2 - 0.045, 0.2, w + 0.25, 0.09, 0.36, "oak", 0.015);
  for (let i = 0; i < 7; i++)
    b.at([0, h / 2 - 0.025 - i * 0.058, 0.21], [0.2, 0, 0], () =>
      b.box(0, 0, 0, w - 0.04, 0.026, 0.055, "oak"),
    );
  for (const x of [-w * 0.32, w * 0.32])
    b.box(x, h / 2 - 0.19, 0.245, 0.01, 0.42, 0.009, "linen");
  b.box(0, h / 2 + 0.13, 0.2, w + 0.45, 0.04, 0.045, "brass");
  for (const s of curtains ? [-1, 1] : [])
    for (let i = 0; i < 4; i++)
      b.cyl(
        s * (w / 2 + 0.045) + (i - 1.5) * 0.046,
        -0.08,
        0.2,
        0.038,
        h + 0.27,
        "cream",
      );
  if (planted) plant(b, -w * 0.28, -h / 2 + 0.003, 0.23, 0.42, "herb");
}

/** Night only recolours the shared `sky` material, so geometry is built once per mount. */
export function architecture(b: ArtBuilder) {
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
  for (const v of walls) {
    const north = v[1] === -3.6 && v[2] > 1,
      bathBack = v[0] === -5 && v[1] === 1.8;
    // Only foreground perimeter and cross-walls are cut; all retained walls share one height.
    const retained =
      north ||
      v[0] === 5.4 ||
      v[0] === 4.6 ||
      (v[0] === 2.6 && v[1] > 0) ||
      (v[0] === -1.6 && v[1] === -2.2) ||
      (v[0] === -1.35 && v[1] === 2) ||
      (v[0] === 0 && v[1] === 2.7);
    const h = v[1] === 0.4 && v[2] > 1 ? 1.95 : retained ? 2.65 : 0.72;
    b.box(v[0], h / 2, v[1], v[2], h, v[3], bathBack ? "tile" : "plaster");
    b.box(v[0], h + 0.03, v[1], v[2] + 0.05, 0.06, v[3] + 0.05, "cap", 0.012);
    b.box(v[0], 0.09, v[1], v[2] + 0.028, 0.14, v[3] + 0.028, "cream");
  }
  b.at([-3.3, 1.72, -3.51], [0, 0, 0], () => windowView(b, 2.38, 1.43));
  b.at([3.6, 1.72, -3.51], [0, 0, 0], () =>
    windowView(b, 1.55, 1.43, true, true),
  );
  b.at([2.492, 1.8, 3.75], [0, -Math.PI / 2, 0], () =>
    windowView(b, 0.62, 0.7, false, true),
  );
  b.box(0, 0.94, -4.37, 3.2, 0.065, 0.07, "dark", 0.014);
  for (let i = 0; i <= 16; i++)
    b.box(-1.54 + i * 0.192, 0.65, -4.37, 0.025, 0.55, 0.025, "metal");
  for (const x of [-0.76, 0.84])
    b.box(x, 1.22, -2.79, 0.055, 2.4, 0.075, "dark");
  b.box(0.04, 2.43, -2.79, 1.66, 0.075, 0.08, "dark");
  b.box(-0.55, 1.23, -2.8, 0.34, 2.28, 0.017, "glass");
  // Frames are seated in authored wall openings. The closed front door belongs
  // to the facade; it does not project beyond the floor or create an extra room.
  const doorFrame = (x: number, z: number, width: number, rotation: number) => {
    b.at([x, 0, z], [0, rotation, 0], () => {
      for (const side of [-1, 1])
        b.box((side * width) / 2, 1.08, 0, 0.06, 2.16, 0.18, "oak");
      b.box(0, 2.18, 0, width + 0.06, 0.08, 0.18, "oak");
      b.box(0, 0.025, 0, width, 0.025, 0.18, "stone");
    });
  };
  doorFrame(-1.6, -0.3, 1, Math.PI / 2);
  doorFrame(-2.8, 1.45, 0.9, Math.PI / 2);
  doorFrame(0.76, 1.2, 1.38, 0);
  b.note("entryDoors");
  doorFrame(-0.9, 4.2, 1, 0);
  b.box(-0.9, 1.04, 4.2, 0.92, 2.08, 0.065, "oak", 0.015);
  for (const y of [0.54, 1.54])
    b.box(-0.9, y, 4.161, 0.73, 0.84, 0.012, "edge", 0.015);
  b.box(-0.54, 1, 4.12, 0.11, 0.027, 0.04, "brass");
  // A single distant landscape belongs to the balcony vista, not another furnished area.
  b.note("balconyVistas");
  b.at([0, 0, -4.49], [0, 0, 0], () => {
    b.box(0, 1.17, 0, 3.16, 1.4, 0.012, "sky");
    b.silhouette(
      [
        [-1.58, 0.5],
        [1.58, 0.5],
        [1.58, 1.17],
        [1.18, 1.4],
        [0.73, 1.17],
        [0.2, 1.67],
        [-0.34, 1.34],
        [-0.85, 1.58],
        [-1.58, 1.08],
      ],
      0.014,
      "mountain",
    );
    b.silhouette(
      [
        [-1.58, 0.5],
        [1.58, 0.5],
        [1.58, 0.85],
        [0.86, 1.1],
        [0.25, 0.95],
        [-0.3, 1.21],
        [-0.97, 1.08],
        [-1.58, 0.86],
      ],
      0.021,
      "mountainDark",
    );
    b.box(0, 0.68, 0.028, 3.16, 0.35, 0.012, "water");
  });
  for (let j = 0; j < 5; j++)
    for (let i = 0; i < 8; i++)
      b.box(
        2.499,
        0.92 + j * 0.13,
        1.7 + i * 0.31,
        0.009,
        0.121,
        0.298,
        (i + j) % 3 ? "tile" : "sage",
      );
  for (let i = 0; i < 7; i++)
    for (let j = 0; j < 1; j++)
      b.box(-4.914, 0.25 + j * 0.29, 0.58 + i * 0.37, 0.01, 0.28, 0.36, "tile");
}

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
  b.at([-1.35, 1.48, 2.085], [0, 0, 0], () => {
    b.ball(0, 0, 0, [0.28, 0.46, 0.026], "dark");
    b.ball(0, 0, 0.024, [0.245, 0.423, 0.012], "mirror");
  });
  // The close-up places hooks on the kitchen partition, across from the mirror.
  b.at([-0.085, 1.48, 2.48], [0, -Math.PI / 2, 0], () => {
    b.box(0, 0.03, 0, 0.09, 0.56, 0.035, "oak");
    b.ball(0, 0.25, 0.044, [0.024, 0.024, 0.04], "brass");
    b.box(0, -0.1, 0.053, 0.13, 0.62, 0.06, "rust", 0.028);
    b.ring(0.35, -0.03, 0.03, 0.07, 0.012, "dark");
    b.box(0.35, -0.19, 0.06, 0.17, 0.25, 0.095, "linen", 0.04);
  });
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
  b.at([-3.45, 1.43, 0.49], [0, 0, 0], () => {
    // Tile and mirror are flush with the actual bedroom/bath shared wall, not a detached backing.
    b.box(0, 0.02, -0.025, 1.05, 1.05, 0.025, "tile");
    b.ring(0, 0.02, 0.024, 0.35, 0.028, "glow");
    b.ball(0, 0.02, 0.02, [0.328, 0.328, 0.013], "mirror");
    b.box(0.49, -0.08, 0.16, 0.036, 0.025, 0.24, "brass");
    b.box(0.49, -0.32, 0.16, 0.055, 0.47, 0.25, "linen", 0.015);
  });
  b.at([-4.72, 1.78, -3.51], [0, 0, 0], () => {
    b.box(0, 0, 0, 0.35, 0.56, 0.055, "oak");
    b.box(0, 0, 0.035, 0.29, 0.5, 0.008, "paper");
    b.ball(0, 0.01, 0.043, [0.13, 0.21, 0.004], "sage");
    b.box(0, -0.08, 0.05, 0.014, 0.32, 0.004, "dark");
  });
}
