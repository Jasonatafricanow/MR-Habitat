import { ArtBuilder } from "./xiyueGeometry";

/**
 * A short exterior so the home sits somewhere: its own lawn, a path to the
 * door, garden planting, and the lake and mountains the balcony looks at.
 * Not a walkable world — nothing here enters navigation.
 */
export const groundY = -0.18;

function pine(b: ArtBuilder, x: number, z: number, s: number) {
  b.cyl(x, groundY + s * 0.4, z, s * 0.09, s * 0.8, "bark", s * 0.06);
  for (let i = 0; i < 4; i++)
    b.cyl(
      x,
      groundY + s * (0.9 + i * 0.62),
      z,
      s * (0.95 - i * 0.2),
      s * 1.05,
      i % 2 ? "foliageDark" : "foliage",
      0,
    );
}

function broadleaf(b: ArtBuilder, x: number, z: number, s: number) {
  b.cyl(x, groundY + s * 0.75, z, s * 0.11, s * 1.5, "bark", s * 0.07);
  const crown: [number, number, number, number][] = [
    [0, 1.9, 0, 0.95],
    [0.55, 1.65, 0.2, 0.7],
    [-0.5, 1.7, -0.25, 0.72],
    [0.1, 2.35, -0.35, 0.62],
    [-0.2, 1.55, 0.5, 0.6],
  ];
  crown.forEach(([dx, dy, dz, r], i) =>
    b.ball(
      x + dx * s,
      groundY + dy * s,
      z + dz * s,
      [r * s, r * s * 0.85, r * s],
      i % 3 === 1 ? "foliageLight" : i % 3 ? "foliageDark" : "foliage",
    ),
  );
}

function shrub(
  b: ArtBuilder,
  x: number,
  z: number,
  s: number,
  flowers = false,
) {
  b.ball(x, groundY + s * 0.28, z, [s * 0.5, s * 0.42, s * 0.45], "foliage");
  b.ball(
    x + s * 0.25,
    groundY + s * 0.36,
    z - s * 0.1,
    [s * 0.32, s * 0.3, s * 0.3],
    "foliageLight",
  );
  if (flowers)
    for (let i = 0; i < 6; i++)
      b.ball(
        x + Math.cos(i * 2.1) * s * 0.38,
        groundY + s * (0.5 + (i % 2) * 0.12),
        z + Math.sin(i * 2.1) * s * 0.34,
        [0.028, 0.028, 0.028],
        i % 3 ? "paper" : "terracotta",
      );
}

export function exterior(b: ArtBuilder) {
  b.note("balconyVistas");
  // Lot lawn, surrounding meadow, shore and lake (north, under the balcony view).
  b.box(0.5, groundY - 0.1, 3, 24, 0.2, 24, "grass");
  b.box(0, groundY - 0.14, 29, 170, 0.2, 82, "grassDark");
  b.box(0, groundY - 0.2, -12.6, 170, 0.2, 3.2, "sand");
  b.box(0, groundY - 0.32, -62, 240, 0.2, 96, "lake");

  // Across the water: low wooded hills, then two layers of mountains lost in haze.
  for (let i = 0; i < 9; i++)
    b.ball(
      -84 + i * 21,
      -1.6,
      -52 - (i % 3) * 5,
      [16 + (i % 4) * 4, 5 + (i % 3) * 2.2, 9],
      "hill",
    );
  for (let i = 0; i < 7; i++)
    b.ball(
      -90 + i * 30,
      -3,
      -86 - (i % 2) * 8,
      [24 + (i % 3) * 6, 15 + ((i * 5) % 7) * 2.4, 14],
      "ridge",
    );
  for (let i = 0; i < 5; i++)
    b.ball(-70 + i * 36, -4, -112, [34, 26 + (i % 2) * 8, 16], "ridgeFar");
  // A shallow valley rim on the other three sides so the horizon never ends in a cliff.
  for (let i = 0; i < 10; i++) {
    const a = Math.PI * 0.08 + (i / 9) * Math.PI * 0.84;
    b.ball(
      Math.cos(a) * 78,
      -2.5,
      10 + Math.sin(a) * 62,
      [22, 7 + (i % 3) * 3, 18],
      i % 2 ? "hill" : "grassDark",
    );
  }

  // Path from the front door to the lot edge.
  for (let i = 0; i < 12; i++)
    b.box(
      -0.9 + Math.sin(i * 0.7) * 0.18,
      groundY + 0.01,
      4.75 + i * 0.72,
      0.62 - (i % 2) * 0.08,
      0.05,
      0.46,
      "path",
      0.03,
    );
  b.box(-0.9, groundY + 0.02, 4.45, 1.3, 0.06, 0.42, "stone", 0.02);

  // Garden planting close to the walls, kept low so cutaway views stay clear.
  shrub(b, -2.2, 4.9, 0.9, true);
  shrub(b, 0.4, 4.9, 0.8);
  shrub(b, 2.4, 4.95, 0.9, true);
  shrub(b, -5.7, 2.6, 1.0);
  shrub(b, -5.75, -1.8, 0.9, true);
  shrub(b, 6.1, 0.9, 1.0, true);
  shrub(b, 5.4, -3.2, 0.8);
  shrub(b, -2.5, -5.1, 0.9);
  shrub(b, 2.5, -5.1, 0.85, true);

  // Hedges frame the lot; the front stays open for the path.
  for (const [x, z, w, d] of [
    [-11.2, 3, 0.7, 22],
    [12.2, 3, 0.7, 22],
    [-6.6, 14.6, 9.3, 0.7],
    [7.6, 14.6, 9.3, 0.7],
  ])
    b.box(x, groundY + 0.42, z, w, 0.84, d, "foliageDark", 0.3);
}

export type Tree = {
  x: number;
  z: number;
  radius: number;
  draw: (b: ArtBuilder) => void;
};
/**
 * Trees are separate assemblies so the camera rig can hide any tree that
 * stands between the camera and the house, as the Sims does with occluders.
 */
export function exteriorTrees(): Tree[] {
  const trees: Tree[] = [];
  const add = (kind: typeof pine, x: number, z: number, s: number) =>
    trees.push({
      x,
      z,
      radius: s * (kind === pine ? 1 : 1.1),
      draw: (b) => kind(b, x, z, s),
    });
  for (const [x, z, s] of [
    [-9.2, -6.8, 2.2],
    [-13.5, 1.5, 2.6],
    [-9.6, 10.5, 2],
    [10.4, -6.2, 2.4],
    [14.2, 6, 2.8],
    [-18, -9.5, 2.6],
    [19, -10.2, 2.4],
  ] as const)
    add(pine, x, z, s);
  for (const [x, z, s] of [
    [-8.6, -1.8, 1.5],
    [9.2, 4.2, 1.6],
    [4.8, 12.2, 1.4],
    [-5.6, 12.4, 1.3],
    [12.5, -2.2, 1.4],
    [-15, 8, 1.9],
  ] as const)
    add(broadleaf, x, z, s);
  // Shoreline trees leave the balcony's view of the water open.
  for (let i = 0; i < 14; i++) {
    const x = -34 + i * 5.3 + ((i * 7) % 3);
    if (Math.abs(x) < 9) continue;
    add(
      i % 3 ? pine : broadleaf,
      x,
      -11 + ((i * 5) % 4) * 0.4,
      1.6 + ((i * 3) % 4) * 0.35,
    );
  }
  return trees;
}
