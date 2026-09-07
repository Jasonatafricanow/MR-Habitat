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

export const observations: Record<
  ObjectId,
  {
    title: string;
    kicker: string;
    intro: string;
    updated: string;
    entries: { title: string; text: string; tag: string }[];
  }
> = {
  desk: {
    title: "桌上的事",
    kicker: "ON THE DESK",
    intro: "有些想法，还在慢慢长成形状。",
    updated: "演示快照 · 今天 14:32",
    entries: [
      {
        title: "给 Agent 一个可以栖居的地方",
        text: "把状态变成日常：工作时去桌前，安静时看看窗外。先感受，再决定下一步。",
        tag: "当前项目",
      },
      {
        title: "空间如何表达“正在思考”？",
        text: "不急着展示一串推理。也许是桌上摊开的纸，也许只是停在窗边的一小会儿。",
        tag: "待探索的问题",
      },
    ],
  },
  books: {
    title: "慢慢积累的书架",
    kicker: "THE BOOKSHELF",
    intro: "一些留下来的理解，被轻轻放在这里。",
    updated: "演示快照 · 昨天 18:20",
    entries: [
      {
        title: "陪伴，也可以是安静的",
        text: "不必每次打开都开始一段对话。知道它在这里，本身就有一点意义。",
        tag: "长期认知投影",
      },
      {
        title: "留白是一种空间",
        text: "物件不需要装满房间，信息也不需要占满视野。让重要的东西有呼吸的余地。",
        tag: "长期认知投影",
      },
    ],
  },
  journal: {
    title: "小屋日记",
    kicker: "A FEW LITTLE MOMENTS",
    intro: "普通的一天，也有值得留住的片刻。",
    updated: "演示快照 · 今天",
    entries: [
      {
        title: "14:32 · 一个新念头",
        text: "外部任务带来一个新问题：如果把观察窗口变成房间，会是什么样子？",
        tag: "示例经历",
      },
      {
        title: "10:15 · 开始新的一天",
        text: "读过的材料已经整理好。留一页空白，给接下来发生的事。",
        tag: "示例经历",
      },
    ],
  },
};
