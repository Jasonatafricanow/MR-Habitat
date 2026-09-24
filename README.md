# MR Habitat

An extensible interactive visualization layer for Mind Runtime — turning agent state, cognition and activity into a persistent spatial presence.
MR Habitat 是 OW 的空间化交互实验：把原本以状态面板、日志和文字展示的 Agent 运行状态，投影成一个可以被观察和轻度交互的持续空间。它不负责思考，也不负责聊天，只负责让 Agent“被看见”。

MR Habitat is an experimental interactive visualization layer for Mind Runtime.

It extends the original Observation Window concept from a diagnostic interface into a lightweight spatial environment where an agent can be observed through presence, movement, activities, speech bubbles, objects, and other visual projections.

Habitat is not intended to become another cognition system, memory system, or primary chat interface.

Mind Runtime remains the source of cognitive state and authority.
Existing interfaces such as Telegram or other agent clients remain the primary interaction surfaces.

Habitat focuses on one question:

> What should a long-running agent feel like when its internal state is no longer represented only by text and dashboards, but by a persistent, observable environment?

The initial implementation is intentionally small.

The environment is a projection layer, not an authority layer. Deleting or replacing a Habitat should never delete or redefine the cognition it represents.

## Design Direction

MR Habitat should remain lightweight before feature-rich, world-agnostic, character-agnostic, read-oriented before write-oriented, projection-driven rather than cognition-owning, compatible with externally authored assets, and loosely coupled to Mind Runtime through a narrow adapter boundary.

The first milestone is not to build a virtual world. It is to determine whether spatial presence is a useful extension of the MR Observation Window.

一个让长期 Agent “住进去”的空间观察窗口。独立、本地、mock-only 的第一版视觉原型。

## 打开小屋

需要 Node.js 22.12+（本次使用 24.15.0）。

```powershell
npm ci
npm run dev
```

打开 http://127.0.0.1:5173 。仅监听本机。

```powershell
npm test
npm run build
npm run preview
```

GitHub Actions 在 push / pull request 上执行 `npm ci`、`npm test` 和 `npm run build`，作为公开的持续验证入口。

## 第一版可以做什么

- 在暖木色的 3D 小屋里观察 Mori：走动、窗边停留、桌前工作、沙发阅读与休息。
- 拖动环绕、滚轮缩放、重置镜头；切换午后与夜晚、暂停视觉活动。
- 点击书架、桌面、日记查看只读示例信息；Escape 关闭。
- 右下角 `···` 打开外部事件演示：工作 / 新想法 / 阅读 / 休息。状态持续 35 秒，speech bubble 8.5 秒后消失。首次进入 12 秒后自动演示一次工作事件，手动操作优先。
- 左上角“小屋”按钮切换两套配色与演示角色外观、显示标记、减少循环动作。
- 无事件时以 28 秒为一段进行低强度的视觉日常。页面隐藏后暂停视觉活动，外部事件仍按真实时间过期。

暂停只冻结角色与本地日常时钟。外部事件 TTL 继续走，恢复后消费仍有效的最新状态。暂停不冻结相机操作。

## 产品与技术边界

React 19 + TypeScript + Vite；Three.js / React Three Fiber / Drei；three-pathfinding；Three AnimationMixer。没有 fork 游戏项目，没有自制 renderer 或 pathfinding engine。

Habitat 自己维护角色的空间与动画状态、镜头、临时 UI。没有聊天框、MR 凭据、生产连接、记忆存储或 cognition 写入接口。Ambient 是视觉节奏，不是认知证据。书架等信息是固定的示例快照，不是实际 MR 内容。

- [短设计与选型](docs/DESIGN.md)
- [实现计划](docs/PLAN.md)
- [世界 / 角色消费接口及限制](docs/ASSETS.md)
- [验证记录](docs/VERIFICATION.md)
- [产品实验记录](docs/product-experiment.md)

当前只交付一套房型；两套配色不代表两种房屋。资产替换接口已拆开，但通用 GLB 文件导入、自动骨骼重定向、世界编辑器、多人系统都未实现。当前 character 是原创的低多边形木偶原型，动作仍是风格化表现。真实 MR 集成、真实手机性能与长期运行稳定性需要后续验证。
