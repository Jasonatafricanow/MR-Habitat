import type { Anchor, WorldDefinition } from "./studio";
import type { Obstacle, Point } from "../runtime/navigation";
export type Transform = { x: number; z: number; rotation: number };
export type Layout = Record<"sofa" | "coffee", Transform>;
export const homeScale = 0.95;
export const layoutKey = "habitat:xiyue-home-v1:instance-local:layout-v1";
export const defaultLayout: Layout = {
  sofa: { x: 1.25, z: -1.25, rotation: -Math.PI / 2 },
  coffee: { x: -0.7, z: -1.3, rotation: 0 },
};
export const rooms = [
  { id: "bedroom", label: "卧室", x: -3.3, z: -1.6, w: 3.4, d: 4 },
  { id: "bathroom", label: "卫浴", x: -3.9, z: 1.8, w: 2.2, d: 2.8 },
  { id: "hall", label: "", x: -2.2, z: 1.2, w: 1.2, d: 1.6 },
  { id: "living", label: "客厅", x: 0.5, z: -0.4, w: 4.2, d: 4.8 },
  { id: "entry", label: "玄关", x: -0.9, z: 3.1, w: 1.8, d: 2.2 },
  { id: "kitchen", label: "厨房", x: 1.3, z: 2.7, w: 2.6, d: 3 },
  { id: "study", label: "书房", x: 4, z: 0.4, w: 2.8, d: 3.2 },
  { id: "nook", label: "窗边", x: 3.6, z: -2.4, w: 2, d: 2.4 },
  { id: "balcony", label: "阳台", x: 0, z: -3.6, w: 3.2, d: 1.6 },
];
// Room footprints are non-overlapping; the kitchen occupies the SE corner
// of the living room's envelope in the reference plan.
export const floorPieces = rooms.flatMap((r) =>
  r.id === "living"
    ? [
        { ...r, z: -0.8, d: 4 },
        { ...r, x: -0.8, z: 1.6, w: 1.6, d: 0.8 },
      ]
    : [r],
);
const rect = (x: number, z: number, w: number, d: number): Obstacle => ({
  minX: x - w / 2,
  maxX: x + w / 2,
  minZ: z - d / 2,
  maxZ: z + d / 2,
});
// Door openings are gaps in these walls; visual cutaway height does not change collision height.
export const walls = [
  [-5, -1.6, 0.14, 4],
  [-3.3, -3.6, 3.4, 0.14],
  [-5, 1.8, 0.14, 2.8],
  [-3.9, 3.2, 2.2, 0.14],
  [-1.6, -2.2, 0.14, 2.8],
  [-1.6, 0.45, 0.14, 0.5],
  [-3.3, 0.4, 3.4, 0.14],
  [-2.8, 0.7, 0.14, 0.6],
  [-2.8, 2.55, 0.14, 1.3],
  [-1.8, 3.1, 0.14, 2.2],
  [-1.6, 4.2, 0.4, 0.14],
  [-0.2, 4.2, 0.4, 0.14],
  [0, 2.7, 0.14, 3],
  [1.3, 4.2, 2.6, 0.14],
  [2.06, 1.2, 1.08, 0.14],
  [2.6, 3.1, 0.14, 2.2],
  [2.6, -2.5, 0.14, 2.2],
  [2.6, 1.2, 0.14, 1.6],
  [4, 2, 2.8, 0.14],
  [5.4, 0.4, 0.14, 3.2],
  [4.6, -2.4, 0.14, 2.4],
  [3.6, -3.6, 2, 0.14],
  [4.2, -1.2, 0.8, 0.14],
  [5, -1.2, 0.8, 0.14],
  [2.1, -2.8, 1, 0.14],
  [-2.3, 2, 1, 0.14],
  [-1.35, 2, 0.9, 0.14], // Entry L return: mirror faces the entrance; opening is to its east.
  [-1.2, -2.8, 0.8, 0.14],
  [1.3, -2.8, 0.6, 0.14],
  [-1.6, -3.6, 0.14, 1.6],
  [1.6, -3.6, 0.14, 1.6],
  [0, -4.4, 3.2, 0.14],
] as const;
export const fixtures = [
  { id: "counter", x: 2.08, z: 2.75, w: 0.7, d: 2.4, h: 0.86 },
  { id: "sink", x: 1.3, z: 3.78, w: 1.1, d: 0.7, h: 0.86 },
  { id: "shower", x: -4.48, z: 2.35, w: 0.8, d: 1.2, h: 0.15 },
  {
    id: "vanity",
    rotation: Math.PI,
    x: -3.45,
    z: 0.85,
    w: 0.9,
    d: 0.48,
    h: 0.8,
  },
  {
    id: "toilet",
    rotation: Math.PI,
    x: -4.55,
    z: 0.85,
    w: 0.55,
    d: 0.6,
    h: 0.48,
  },
];
export const props = [
  {
    id: "bed",
    rotation: Math.PI / 2,
    x: -3.77,
    z: -1.5,
    w: 2.25,
    d: 1.6,
    h: 0.5,
  },
  { id: "wardrobe", x: -1.99, z: -2.55, w: 0.6, d: 1.45, h: 1.9 },
  { id: "desk", x: 4.82, z: 0.4, w: 0.65, d: 1.6, h: 0.8 },
  { id: "books", x: 3.5, z: 1.65, w: 1.5, d: 0.4, h: 1.55 },
  { id: "chair", x: 3.8, z: -2.65, w: 0.75, d: 0.8, h: 0.42 },
  { id: "entry-bench", x: -1.43, z: 3.08, w: 0.4, d: 1.3, h: 0.45 },
  { id: "entry-plant", x: -1.43, z: 3.93, w: 0.34, d: 0.34, h: 0.85 },
  { id: "plant", x: 0.95, z: -3.8, w: 0.5, d: 0.5, h: 0.8 },
  { id: "balcony-chair", x: -0.9, z: -3.8, w: 0.6, d: 0.8, h: 0.45 },
  { id: "living-books", x: 2.35, z: -1.9, w: 0.3, d: 1.7, h: 2.1 },
  { id: "fridge", x: 0.65, z: 3.75, w: 0.64, d: 0.66, h: 1.7 },
  { id: "nook-table", x: 3.05, z: -2.95, w: 0.42, d: 0.42, h: 0.6 },
  { id: "nightstand", x: -4.55, z: -2.7, w: 0.45, d: 0.45, h: 0.55 },
  { id: "study-chair", x: 4.15, z: 0.85, w: 0.46, d: 0.46, h: 0.7 },
  { id: "balcony-table", x: -1.06, z: -3.18, w: 0.38, d: 0.38, h: 0.55 },
  { id: "living-lamp", x: -1.28, z: -2.25, w: 0.3, d: 0.3, h: 1.95 },
  { id: "living-chair", x: -0.7, z: -2.12, w: 0.64, d: 0.64, h: 0.83 },
  { id: "balcony-plant", x: 1.17, z: -3.12, w: 0.3, d: 0.3, h: 0.6 },
  { id: "bathroom-stool", x: -3.35, z: 2.75, w: 0.38, d: 0.38, h: 0.43 },
];
export function furnitureObstacle(id: keyof Layout, t: Transform): Obstacle {
  const [w, d] = id === "sofa" ? [2.3, 0.85] : [0.85, 0.55];
  return rect(
    t.x,
    t.z,
    Math.abs(Math.cos(t.rotation)) * w + Math.abs(Math.sin(t.rotation)) * d,
    Math.abs(Math.sin(t.rotation)) * w + Math.abs(Math.cos(t.rotation)) * d,
  );
}
function sofaAnchor(layout: Layout): Anchor {
  const t = layout.sofa;
  const point = (z: number): Point => [
    t.x + Math.sin(t.rotation) * z,
    0,
    t.z + Math.cos(t.rotation) * z,
  ];
  return {
    position: point(1.05),
    dock: point(0.12),
    facing: t.rotation,
    label: "在沙发上休息",
  };
}
export function interactionAnchors(layout: Layout): Record<string, Anchor> {
  const anchors: Record<string, Anchor> = {
    entry_return: { position: [-0.85, 0, 2.65], facing: 0, label: "回到家" },
    sofa_rest: sofaAnchor(layout),
    window_daydream: {
      position: [3.6, 0, -1.8],
      facing: Math.PI,
      label: "看看窗外",
    },
    desk_work: {
      position: [4, 0, 0.2],
      facing: Math.PI / 2,
      label: "在桌前工作",
    },
    bookshelf_read: { position: [3.3, 0, 0.85], facing: 0, label: "翻阅书架" },
    kitchen_cook: {
      position: [1.2, 0, 2.4],
      facing: Math.PI / 2,
      label: "准备一餐",
    },
    bed_sleep: {
      position: [-2.2, 0, -0.65],
      facing: -Math.PI / 2,
      label: "卧室休息",
    },
    bathroom_bathe: {
      position: [-3.45, 0, 1.65],
      facing: -Math.PI / 2,
      label: "卫浴",
    },
    wardrobe_focus: {
      position: [-2.3, 0, -1.25],
      facing: Math.PI / 2,
      label: "挑选衣服",
    },
    balcony_air: {
      position: [0, 0, -3.65],
      facing: Math.PI,
      label: "阳台透气",
    },
  };
  return Object.fromEntries(
    Object.entries(anchors).map(([id, a]) => [
      id,
      {
        ...a,
        position: a.position.map((v, i) =>
          i === 1 ? v : v * homeScale,
        ) as Point,
        ...(a.dock
          ? {
              dock: a.dock.map((v, i) =>
                i === 1 ? v : v * homeScale,
              ) as Point,
            }
          : {}),
      },
    ]),
  );
}
export function buildHome(layout: Layout): WorldDefinition {
  const a = interactionAnchors(layout);
  // Mask rectangular navigation envelope outside the authored room union.
  const outside: Obstacle[] = [];
  for (let x = -5.1; x < 5.5; x += 0.1)
    for (let z = -4.5; z < 5.1; z += 0.1) {
      if (
        !floorPieces.some(
          (r) =>
            x + 0.05 >= r.x - r.w / 2 &&
            x + 0.05 <= r.x + r.w / 2 &&
            z + 0.05 >= r.z - r.d / 2 &&
            z + 0.05 <= r.z + r.d / 2,
        )
      )
        outside.push(rect(x + 0.05, z + 0.05, 0.1, 0.1));
    }
  return {
    // Preserve 90 cm doorways after clearance without changing the authored walls.
    navigationCellSize: 0.1,
    id: "xiyue-home-v1",
    name: "溪月之家",
    subtitle: "同样走过的路，更安静的家。",
    bounds: {
      minX: -5.1 * homeScale,
      maxX: 5.5 * homeScale,
      minZ: -4.5 * homeScale,
      maxZ: 5.1 * homeScale,
    },
    spawn: a.entry_return.position,
    obstacles: [
      ...outside,
      ...walls.map((v) => rect(v[0], v[1], v[2], v[3])),
      ...fixtures.map((p) => rect(p.x, p.z, p.w, p.d)),
      ...props.map((p) => rect(p.x, p.z, p.w, p.d)),
      ...(["sofa", "coffee"] as const).map((id) =>
        furnitureObstacle(id, layout[id]),
      ),
    ].map((r) => ({
      minX: r.minX * homeScale,
      maxX: r.maxX * homeScale,
      minZ: r.minZ * homeScale,
      maxZ: r.maxZ * homeScale,
    })),
    anchors: {
      idle: a.entry_return,
      working: a.desk_work,
      reading: a.bookshelf_read,
      thinking: a.window_daydream,
      resting: a.sofa_rest,
      sleeping: a.bed_sleep,
    },
  };
}
export function encodeLayout(layout: Layout) {
  return JSON.stringify({
    worldId: "xiyue-home-v1",
    version: 1,
    props: layout,
  });
}
export function decodeLayout(raw: string | null): Layout {
  try {
    const v = JSON.parse(raw ?? "null");
    if (v?.worldId !== "xiyue-home-v1" || v.version !== 1)
      return structuredClone(defaultLayout);
    for (const id of ["sofa", "coffee"])
      if (
        !v.props?.[id] ||
        !["x", "z", "rotation"].every(
          (k) =>
            typeof v.props[id][k] === "number" &&
            Number.isFinite(v.props[id][k]) &&
            Math.abs(v.props[id][k]) < 20,
        )
      )
        return structuredClone(defaultLayout);
    return { sofa: { ...v.props.sofa }, coffee: { ...v.props.coffee } };
  } catch {
    return structuredClone(defaultLayout);
  }
}
