import type { Activity } from "../runtime/semantic";
import type { Point, Obstacle } from "../runtime/navigation";

export type ObjectId = "desk" | "books" | "journal";
export interface Anchor {
  position: Point;
  facing: number;
  label: string;
  dock?: Point;
}
export interface WorldDefinition {
  navigationCellSize?: number;
  id: string;
  name: string;
  subtitle: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  obstacles: Obstacle[];
  anchors: Record<Activity, Anchor>;
  spawn: Point;
}
export const studio: WorldDefinition = {
  id: "paperwood",
  name: "纸木小屋",
  subtitle: "一扇窗，一些书，慢一点的日常。",
  bounds: { minX: -4.25, maxX: 4.25, minZ: -3.05, maxZ: 3.05 },
  obstacles: [
    { minX: 0.75, maxX: 3.45, minZ: -3.1, maxZ: -1.95 },
    { minX: -4.4, maxX: -3.05, minZ: -0.9, maxZ: 1.7 },
    { minX: -1.65, maxX: -0.25, minZ: 0.1, maxZ: 1.15 },
    { minX: -0.75, maxX: 0.55, minZ: -3.5, maxZ: -2.55 },
    { minX: 3.3, maxX: 4.3, minZ: 1.9, maxZ: 3.1 },
    { minX: -4.3, maxX: -3.15, minZ: -3.1, maxZ: -2.15 },
  ],
  spawn: [1, 0, 1.65],
  anchors: {
    idle: { position: [1, 0, 1.65], facing: 0.5, label: "在小屋里走走" },
    working: {
      position: [2.1, 0, -1.42],
      facing: Math.PI,
      label: "在桌前整理想法",
    },
    reading: {
      position: [-2.4, 0, 0.5],
      dock: [-3.38, 0, 0.5],
      facing: Math.PI / 2,
      label: "翻开了一本书",
    },
    thinking: {
      position: [-2.3, 0, -2.2],
      facing: Math.PI,
      label: "在窗边停一会儿",
    },
    resting: {
      position: [-2.4, 0, 0.5],
      dock: [-3.38, 0, 0.5],
      facing: Math.PI / 2,
      label: "慢下来，歇一会儿",
    },
    sleeping: {
      position: [-2.4, 0, 0.5],
      dock: [-3.38, 0, 0.5],
      facing: Math.PI / 2,
      label: "在沙发上打个盹",
    },
  },
};
