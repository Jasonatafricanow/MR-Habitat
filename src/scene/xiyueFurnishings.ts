import {
  ArtBuilder,
  book,
  cup,
  openBook,
  lamp,
  plant,
  table,
  type Mat,
} from "./xiyueGeometry";

export function seat(b: ArtBuilder, w = 0.75, outdoor = false) {
  for (const x of [-1, 1])
    for (const z of [-1, 1])
      b.box(
        x * (w / 2 - 0.085),
        0.16,
        z * 0.29,
        0.065,
        0.3,
        0.065,
        "dark",
        0.01,
      );
  b.box(0, 0.32, 0, w, 0.16, 0.72, "oak", 0.04);
  if (outdoor) {
    for (let i = 0; i < 7; i++) {
      b.box(
        -w / 2 + 0.05 + (i * (w - 0.1)) / 6,
        0.45,
        0,
        0.045,
        0.05,
        0.65,
        "edge",
        0.012,
      );
      b.at([0, 0.63, -0.29], [-0.17, 0, 0], () =>
        b.box(
          -w / 2 + 0.05 + (i * (w - 0.1)) / 6,
          0,
          0,
          0.045,
          0.52,
          0.045,
          "oak",
          0.01,
        ),
      );
    }
  } else {
    const n = w > 1 ? 3 : 1;
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + 0.12 + ((i + 0.5) * (w - 0.24)) / n;
      b.box(
        x,
        0.47,
        0.035,
        (w - 0.26) / n,
        0.2,
        0.66,
        w > 1 ? "moss" : "linen",
        0.075,
      );
      b.at([x, 0.76, -0.27], [-0.12, 0, 0], () =>
        b.box(
          0,
          0,
          0,
          (w - 0.25) / n,
          0.53,
          0.22,
          w > 1 ? "moss" : "cream",
          0.085,
        ),
      );
    }
  }
  for (const s of [-1, 1])
    b.box(
      s * (w / 2 - 0.065),
      0.63,
      0.01,
      0.13,
      outdoor ? 0.07 : 0.28,
      0.79,
      outdoor ? "oak" : "sage",
      0.055,
    );
  if (!outdoor) {
    b.at([-w / 2 + 0.28, 0.68, -0.04], [0.15, 0.15, -0.18], () =>
      b.box(0, 0, 0, 0.32, 0.32, 0.13, "cream", 0.06),
    );
    // Draped throw, a few broad folds rather than a rigid cube.
    for (let i = 0; i < 5; i++) {
      const x = w / 2 - 0.31 + i * 0.035;
      b.box(x, 0.59, 0.18, 0.046, 0.035, 0.49, "linen", 0.012);
      b.box(x, 0.39, 0.39, 0.046, 0.4, 0.035, "linen", 0.012);
    }
  }
}

function shelf(
  b: ArtBuilder,
  w: number,
  h: number,
  depth: number,
  open = false,
) {
  if (!open) b.box(0, h / 2, -depth / 2 + 0.025, w, h, 0.05, "dark");
  for (const x of [-1, 1])
    b.box(x * (w / 2 - 0.035), h / 2, 0, 0.07, h, depth, "oak");
  const rows = Math.floor(h / 0.38);
  for (let j = 0; j <= rows; j++) {
    const y = 0.1 + (j * (h - 0.14)) / rows;
    b.box(0, y, 0, w, 0.048, depth, "oak");
    if (j === rows) continue;
    const count = Math.floor((w - 0.2) / 0.095);
    for (let i = 0; i < count; i++) {
      const bh = 0.18 + ((i * 7 + j * 3) % 5) * 0.025;
      const x = -w / 2 + 0.13 + i * 0.095;
      if ((i + j * 2) % 11 === 9) continue;
      const color: Mat = (
        ["moss", "linen", "rust", "dark", "blue", "edge"] as const
      )[(i + j * 2) % 6];
      b.box(
        x,
        y + 0.025 + bh / 2,
        0.005,
        0.065,
        bh,
        depth * 0.65,
        color,
        0.004,
      );
      b.box(x, y + 0.065, depth * 0.335, 0.046, 0.016, 0.005, "paper");
    }
  }
}

export function furnishing(
  b: ArtBuilder,
  id: string,
  w: number,
  d: number,
  h: number,
) {
  switch (id) {
    case "living-books":
      b.at([0, 0, 0], [0, -Math.PI / 2, 0], () => {
        shelf(b, d, h, w);
        plant(b, -0.65, h, 0, 0.5, "trailing");
      });
      break;
    case "books":
      b.at([0, 0, 0], [0, Math.PI, 0], () => {
        shelf(b, w, h, d, true);
      });
      break;
    case "chair":
      seat(b);
      break;
    case "balcony-chair":
      seat(b, 0.58, true);
      break;
    case "study-chair":
      b.at([0, 0, 0], [0, Math.PI / 2, 0], () => {
        table(b, 0.43, 0.42, 0.44);
        b.box(0, 0.47, 0, 0.4, 0.07, 0.39, "linen", 0.03);
        for (const x of [-0.18, 0.18])
          b.box(x, 0.67, -0.18, 0.04, 0.46, 0.04, "oak");
        b.box(0, 0.85, -0.18, 0.43, 0.15, 0.06, "oak", 0.025);
      });
      break;
    case "plant":
      plant(b, 0, 0, 0, 1.15, "woody");
      break;
    case "entry-plant":
      plant(b, 0, 0, 0, 0.78, "woody");
      break;
    case "balcony-plant":
      plant(b, 0, 0, 0, 0.66, "broadleaf");
      break;
    case "living-chair":
      b.note("livingArmchairs");
      // The unupholstered accent chair shown in the floor plan, not another nook copy.
      for (const x of [-0.25, 0.25])
        for (const z of [-0.24, 0.24])
          b.box(x, 0.23, z, 0.045, 0.46, 0.045, "dark", 0.01);
      b.box(0, 0.44, 0, 0.57, 0.05, 0.54, "oak", 0.02);
      for (let i = 0; i < 8; i++)
        b.box(-0.23 + i * 0.066, 0.475, 0, 0.035, 0.025, 0.48, "linen");
      for (const x of [-0.26, 0.26]) {
        b.box(x, 0.65, -0.255, 0.045, 0.43, 0.045, "dark");
        b.box(x, 0.62, 0, 0.055, 0.045, 0.56, "oak", 0.012);
      }
      for (let i = 0; i < 5; i++)
        b.box(-0.2 + i * 0.1, 0.71, -0.26, 0.04, 0.25, 0.04, "oak", 0.006);
      break;
    case "living-lamp":
      b.cyl(0, 0.04, 0, 0.15, 0.08, "dark");
      b.cyl(0, 0.83, 0, 0.023, 1.65, "dark");
      b.ball(0, 1.72, 0, [0.27, 0.3, 0.27], "glow");
      for (let i = 0; i < 9; i++) {
        const y = -0.24 + i * 0.06;
        b.ring(
          0,
          1.72 + y,
          0,
          0.268 * Math.sqrt(1 - (y / 0.3) ** 2),
          0.004,
          "linen",
          [Math.PI / 2, 0, 0],
        );
      }
      break;
    case "nook-table":
    case "balcony-table":
      b.cyl(0, h, 0, w / 2, 0.065, "oak");
      for (let i = 0; i < 3; i++)
        b.at([0, 0, 0], [0, (i * Math.PI * 2) / 3, 0], () =>
          b.at([w * 0.27, h / 2, 0], [0, 0, 0.08], () =>
            b.cyl(0, 0, 0, 0.025, h, "dark"),
          ),
        );
      if (id === "nook-table") openBook(b, -0.05, h + 0.035, 0.04);
      else book(b, -0.065, h + 0.035, 0.04, 0.15, 0.18, "moss");
      cup(b, 0.09, h + 0.035, -0.09);
      break;
    case "nightstand":
      table(b, w, d, h);
      b.box(0, h - 0.13, 0.02, w - 0.08, 0.15, d - 0.07, "oak", 0.01);
      b.ball(0, h - 0.12, d / 2, [0.025, 0.025, 0.025], "brass");
      lamp(b, 0.07, h + 0.055, -0.07, 0.44);
      book(b, -0.07, h + 0.055, 0.09, 0.19, 0.18);
      break;
    case "bed":
      // Layered bed frame, pillows and a folded wool throw.
      b.box(0, 0.23, 0, w, 0.33, d, "dark", 0.035);
      b.box(0, 0.63, -d / 2 + 0.05, w + 0.04, 1.12, 0.09, "oak", 0.035);
      for (let i = 0; i < 10; i++)
        b.box(
          -w / 2 + 0.08 + (i * (w - 0.16)) / 9,
          0.8,
          -d / 2 + 0.11,
          0.035,
          0.66,
          0.018,
          "edge",
          0.008,
        );
      b.box(0, 0.47, 0, w - 0.035, 0.24, d - 0.035, "cream", 0.095);
      b.box(0, 0.62, 0.27, w + 0.04, 0.18, d - 0.6, "linen", 0.09);
      for (const x of [-0.4, 0.4]) {
        b.at([x, 0.69, -0.76], [0.1, 0, x * 0.08], () =>
          b.box(0, 0, 0, 0.66, 0.2, 0.47, "cream", 0.09),
        );
        b.at([x, 0.76, -0.52], [0.12, 0, -x * 0.14], () =>
          b.box(0, 0, 0, 0.52, 0.16, 0.29, "sage", 0.07),
        );
      }
      b.box(0, 0.74, 0.69, w + 0.05, 0.07, 0.55, "moss", 0.035);
      for (const side of [-1, 1])
        b.box(
          side * (w / 2 + 0.005),
          0.53,
          0.69,
          0.055,
          0.45,
          0.55,
          "moss",
          0.025,
        );
      for (let i = 0; i < 9; i++)
        b.box(
          -0.69 + i * 0.17,
          0.783 + Math.sin(i) * 0.006,
          0.69,
          0.025,
          0.012,
          0.53,
          "sage",
          0.004,
        );
      break;
    case "bathroom-stool":
      table(b, w, d, h);
      b.box(0, h + 0.07, 0.03, 0.29, 0.06, 0.21, "linen", 0.02);
      b.box(0, h + 0.115, 0.035, 0.27, 0.035, 0.19, "cream", 0.015);
      break;
    case "wardrobe":
      b.box(0, h / 2, 0, w, h, d, "dark", 0.03);
      for (const z of [-0.35, 0.35]) {
        b.box(-w / 2 - 0.015, h / 2, z, 0.04, h - 0.12, 0.66, "oak", 0.01);
        for (let i = 0; i < 16; i++)
          b.box(
            -w / 2 - 0.04,
            0.2 + i * 0.095,
            z,
            0.025,
            0.034,
            0.54,
            "edge",
            0.006,
          );
        b.box(
          -w / 2 - 0.07,
          0.93,
          z > 0 ? 0.08 : -0.08,
          0.04,
          0.15,
          0.035,
          "brass",
          0.012,
        );
      }
      break;
    case "entry-bench":
      b.note("entryBenches");
      b.box(0, h, 0, w, 0.11, d, "oak", 0.025);
      for (const z of [-d / 2 + 0.1, d / 2 - 0.1])
        b.box(0, h / 2 - 0.025, z, w - 0.055, h - 0.05, 0.075, "dark");
      b.cyl(0, h + 0.08, 0.36, 0.13, 0.06, "dark", 0.16);
      b.ball(0, h + 0.12, 0.36, [0.08, 0.045, 0.06], "metal");
      for (const z of [-0.18, 0.04]) {
        b.ball(0.035, 0.065, z, [0.15, 0.06, 0.07], "dark");
        b.box(-0.04, 0.1, z, 0.09, 0.07, 0.11, "linen", 0.03);
      }
      b.box(0, h + 0.063, -0.28, w + 0.025, 0.025, 0.27, "rust", 0.01);
      b.box(0.2, 0.31, -0.28, 0.025, 0.34, 0.27, "rust", 0.01);
      break;
    case "desk":
      table(b, w, d);
      b.box(0.02, 0.53, 0.48, 0.51, 0.38, 0.48, "oak", 0.02);
      for (const y of [0.43, 0.59]) {
        b.box(-0.255, y, 0.48, 0.02, 0.14, 0.43, "edge");
        b.box(-0.28, y, 0.48, 0.03, 0.028, 0.1, "brass");
      }
      // Open laptop, pages, pencil pot and task light.
      b.box(-0.05, 0.827, -0.18, 0.38, 0.025, 0.46, "metal", 0.014);
      b.at([0.11, 1.015, -0.18], [0, 0, 0.13], () => {
        b.box(0, 0, 0, 0.027, 0.34, 0.46, "metal", 0.014);
        b.box(-0.017, 0, 0, 0.008, 0.28, 0.39, "blue");
      });
      book(b, -0.05, 0.82, 0.5, 0.31, 0.3, "moss");
      b.box(-0.08, 0.879, 0.5, 0.23, 0.004, 0.25, "paper");
      for (let i = 0; i < 5; i++)
        b.box(-0.09, 0.883, 0.43 + i * 0.026, 0.13, 0.004, 0.004, "ink");
      b.cyl(0.06, 0.91, 0.71, 0.06, 0.18, "clay");
      for (let i = 0; i < 4; i++)
        b.at([0.03 + i * 0.021, 1.05, 0.71], [0.1, 0, (i - 2) * 0.12], () =>
          b.cyl(0, 0, 0, 0.007, 0.24, "dark"),
        );
      // Replace the duplicated bedside shade with the reference's jointed task lamp.
      b.cyl(0, 0.839, -0.64, 0.09, 0.035, "metal");
      b.at([0, 1.04, -0.64], [0, 0, -0.22], () =>
        b.cyl(0, 0, 0, 0.014, 0.4, "metal"),
      );
      b.at([-0.09, 1.25, -0.64], [0, 0, -1.0], () =>
        b.cyl(0, 0, 0, 0.014, 0.25, "metal"),
      );
      b.at([-0.18, 1.29, -0.64], [0, 0, -0.3], () =>
        b.cyl(0, 0, 0, 0.105, 0.11, "metal", 0.025),
      );
      break;
    case "fridge":
      b.box(0, h / 2, 0, w, h, d, "cream", 0.055);
      b.box(0, 1.16, -d / 2 - 0.014, w - 0.035, 0.94, 0.065, "paper", 0.025);
      b.box(0, 0.37, -d / 2 - 0.014, w - 0.035, 0.55, 0.065, "cream", 0.025);
      for (const y of [0.54, 0.9])
        b.box(-0.22, y, -d / 2 - 0.062, 0.035, 0.22, 0.035, "brass", 0.012);
      b.box(0.06, 1.28, -d / 2 - 0.052, 0.23, 0.27, 0.006, "linen");
      b.ball(0.06, 1.4, -d / 2 - 0.066, [0.018, 0.018, 0.009], "clay");
      for (let i = 0; i < 3; i++)
        b.box(
          0.06,
          1.31 - i * 0.045,
          -d / 2 - 0.058,
          0.14,
          0.009,
          0.004,
          "ink",
        );
      break;
  }
}

export function fixture(
  b: ArtBuilder,
  id: string,
  w: number,
  d: number,
  h: number,
) {
  if (id === "shower") {
    b.box(0, 0.075, 0, w, 0.15, d, "cream", 0.025);
    b.box(0, 0.155, 0, w - 0.1, 0.015, d - 0.1, "stone", 0.015);
    b.cyl(0.16, 0.169, 0.3, 0.04, 0.008, "metal");
    b.box(-w / 2 + 0.025, 1.04, 0, 0.035, 1.8, d, "tile");
    b.box(w / 2 - 0.02, 1.03, -0.3, 0.014, 1.75, d - 0.6, "glass");
    for (const z of [-d / 2, d / 2 - 0.6])
      b.box(w / 2 - 0.02, 1.03, z, 0.024, 1.8, 0.024, "brass");
    b.box(w / 2 - 0.02, 1.93, -0.3, 0.028, 0.028, d - 0.6, "brass");
    b.cyl(-0.29, 1.13, -0.36, 0.018, 1.5, "brass");
    b.box(-0.12, 1.85, -0.36, 0.35, 0.035, 0.035, "brass", 0.015);
    b.cyl(0.03, 1.83, -0.36, 0.13, 0.028, "metal");
    b.box(-0.3, 0.91, 0.17, 0.14, 0.05, 0.35, "dark");
    for (let i = 0; i < 3; i++) {
      b.cyl(-0.29, 1.03, 0.06 + i * 0.1, 0.03, 0.2, i % 2 ? "clay" : "cream");
      b.cyl(-0.29, 1.145, 0.06 + i * 0.1, 0.018, 0.03, "dark");
    }
    return;
  }
  if (id === "toilet") {
    b.box(0, 0.48, 0.23, 0.46, 0.62, 0.15, "cream", 0.07);
    b.ball(0, 0.26, -0.035, [0.2, 0.25, 0.24], "cream");
    b.ball(0, 0.48, -0.045, [0.24, 0.07, 0.29], "cream");
    b.ball(0, 0.518, -0.05, [0.15, 0.018, 0.2], "stone");
    b.box(0, 0.802, 0.23, 0.1, 0.018, 0.035, "brass", 0.008);
    return;
  }
  b.box(0, h / 2, 0, w, h, d, id === "vanity" ? "oak" : "sage", 0.025);
  b.box(0, 0.055, 0, w - 0.1, 0.1, d - 0.08, "dark");
  b.box(0, h + 0.027, 0, w + 0.035, 0.065, d + 0.035, "stone", 0.02);
  if (id === "counter") {
    for (const z of [-0.8, 0, 0.8]) {
      b.box(
        -w / 2 - 0.012,
        h / 2 + 0.05,
        z,
        0.03,
        h - 0.17,
        0.74,
        "moss",
        0.015,
      );
      b.box(-w / 2 - 0.045, 0.7, z, 0.03, 0.025, 0.24, "brass", 0.008);
    }
    b.box(-w / 2 - 0.035, 0.4, -0.65, 0.045, 0.43, 0.61, "metal", 0.02);
    b.box(-w / 2 - 0.06, 0.4, -0.65, 0.01, 0.3, 0.46, "mirror", 0.015);
    b.box(-w / 2 - 0.08, 0.66, -0.65, 0.05, 0.025, 0.44, "brass");
    b.box(0, h + 0.066, -0.65, 0.56, 0.025, 0.67, "metal", 0.02);
    for (const x of [-0.16, 0.16])
      for (const z of [-0.82, -0.47]) {
        b.cyl(x, h + 0.088, z, 0.105, 0.02, "dark");
        b.ring(x, h + 0.104, z, 0.08, 0.009, "brass", [Math.PI / 2, 0, 0]);
      }
    b.cyl(0, h + 0.21, -0.67, 0.18, 0.23, "moss");
    b.cyl(0, h + 0.34, -0.67, 0.185, 0.035, "sage", 0.14);
    b.ball(0, h + 0.385, -0.67, [0.035, 0.035, 0.035], "dark");
    for (const z of [-0.9, -0.44])
      b.box(0, h + 0.22, z, 0.18, 0.045, 0.09, "dark", 0.018);
    b.box(0, h + 0.08, 0.26, 0.48, 0.03, 0.45, "oak", 0.03);
    b.ball(0.02, h + 0.14, 0.26, [0.16, 0.065, 0.1], "edge");
    b.note("kettles");
    b.ball(0.04, h + 0.19, 0.57, [0.115, 0.14, 0.105], "metal");
    b.cyl(0.04, h + 0.325, 0.57, 0.066, 0.02, "brass");
    b.ring(0.04, h + 0.36, 0.57, 0.098, 0.014, "dark");
    b.at([-0.09, h + 0.22, 0.57], [0, 0, -0.7], () =>
      b.cyl(0, 0, 0, 0.038, 0.2, "metal", 0.024),
    );
    b.cyl(0.06, h + 0.19, 0.93, 0.085, 0.26, "cream");
    for (let i = 0; i < 4; i++)
      b.cyl(0.02 + i * 0.025, h + 0.42, 0.93, 0.012, 0.3, "oak");
    b.box(-0.4, 0.49, 0.36, 0.025, 0.4, 0.25, "linen", 0.01);
  } else {
    for (const x of [-w / 4, w / 4]) {
      b.box(
        x,
        h / 2 + 0.02,
        -d / 2 - 0.012,
        w / 2 - 0.035,
        h - 0.14,
        0.03,
        id === "vanity" ? "edge" : "sage",
        0.015,
      );
      b.box(x, h - 0.15, -d / 2 - 0.037, 0.14, 0.025, 0.035, "brass", 0.006);
    }
    b.box(0, h + 0.074, 0, 0.61, 0.025, 0.39, "metal", 0.08);
    b.box(0, h + 0.096, 0, 0.49, 0.025, 0.28, "mirror", 0.075);
    for (const x of [-0.3, 0.3])
      b.box(x, h + 0.115, 0, 0.045, 0.07, 0.4, "cream", 0.02);
    for (const z of [-0.18, 0.18])
      b.box(0, h + 0.115, z, 0.62, 0.07, 0.045, "cream", 0.02);
    b.cyl(0, h + 0.26, 0.23, 0.018, 0.4, "brass");
    b.box(0, h + 0.44, 0.14, 0.036, 0.036, 0.2, "brass", 0.014);
    b.cyl(0.44, h + 0.14, 0.1, 0.045, 0.2, "clay");
    b.box(0.44, h + 0.255, 0.08, 0.08, 0.03, 0.025, "brass");
  }
}
