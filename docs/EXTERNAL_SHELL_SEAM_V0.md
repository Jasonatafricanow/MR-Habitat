# External House Shell Seam V0

本轮只建立视觉替换接口。Paperwood 与 Xiyue Home 均继续使用原 procedural geometry；没有创建、导出或启用 house.glb，没有 Art Pass 或 House Import UI。

## 数据与适配边界

`src/assets/shell.ts` 定义纯 JSON 的 `FixedShellSource`：

```ts
// 当前两个正式 WorldPackage 的声明
fixedShell: { schemaVersion: 1, kind: "procedural" }

// 未来 WorldPackage 可声明；此路径仅为示例，仓库中没有该文件
fixedShell: { schemaVersion: 1, kind: "glb", uri: "/worlds/example/house.glb" }
```

Descriptor 没有 React、Three.js instance 或函数。`WorldPackage.definition` 继续独立提供 bounds、spawn、obstacles、anchors 等语义；既有 rooms 和环境设置也不从 GLB 推导。完整 WorldPackage 仍保留现有 R3F Surface 组合入口，本轮只让 shell source 成为独立数据，没有把整个 package 改造成跨引擎标准。

HabitatScene 将 source 传给 Surface，Surface 的 `FixedShell` 适配器选择原 procedural children 或统一 `ExternalShell`。Xiyue 的 homeScale 仅应用于原 procedural geometry；外部 GLB 不继承这个缩放。MovableProps、标记和 imported layer 在 shell 替换分支之外。Paperwood 窗台植物保留原变换，作为 shell 之外的装饰节点。

未来 house.glb 只应包含建筑固定结构（墙、地板、天花、门窗、隔断、阳台、固定厨卫等）。沙发、床、桌、衣柜、植物、灯和装饰继续由家具层提供。Loader 不具备自动识别/剥离家具或自动验证房屋语义的能力，资源作者需遵守此内容边界。

## Loader

`src/scene/shellLoader.ts` 按 URI fetch GLB，复用现有 GLB binary parser；不读写 Furniture Registry、不执行家具归一化、不生成碰撞或导航。文件必须已按世界坐标对齐：米制、Y 向上，保留原始 pivot 和变换。未来接入真实 shell 时，维护者仍需保证其视觉与独立 world semantics 对齐。

当前继承 parser 的自包含 GLB 2.0、32 MB、复杂度及解码器限制（无 Draco/Meshopt/KTX2）。动画为静态，GLB 灯不接管环境照明。HTTP/解析失败显示局部错误，卸载/切换取消请求并释放 geometry/material/texture；失败不会自动切回另一套房屋或改动语义。

## 验证（2026-09-08）

- 新增 3 个测试：真实小型 box GLB 加载及原始偏移坐标保留；HTTP 404/损坏 GLB/取消请求；两个正式 package 仍为 procedural、切换 source 只选择外部视觉分支且 definition/Surface 引用保留。
- 复用现有 `public/fixtures/crate.glb` 作为 loader fixture，没有新增房屋、没有把 fixture 配到正式 World。
- `npm test`：11 files / 51 tests 全部通过，包括原 furniture import/storage/placement/navigation、Xiyue、motion/wardrobe 等测试。
- `npm run build`：通过，保留既有 Three.js 大 chunk 提示。
- production preview 刷新后检查 Xiyue 与 Paperwood 场景；已有两个 imported asset/layout 恢复，导入衣柜 Focus 和工作台只读 projection 正常。未重新跑上一轮全部导入交互矩阵，相关业务代码没有修改。
- 外部 shell loader 在自动化测试中验证，本轮没有启用真实外部 house World 或新增可体验的 House Import 功能。

结论：替换接口已建立并测试；Xiyue 当前正式实现仍是原 procedural shell。本轮到此结束。
