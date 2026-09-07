# Visual slice implementation plan

**Goal:** Make an agent feel present in a small, inspectable home.
**Spec:** DESIGN.md. User authorizes autonomous implementation; short plan in place of a large speculative architecture.
**Execution:** writing-plans / subagent-driven-development / test-driven-development / verification-before-completion. Empty repository is already isolated; work in codex/habitat-vertical-slice.

1. Runtime (`src/runtime/`): write failing semantic and route tests; implement pure event selection and three-pathfinding adapter; test TTL, malformed input, ambient separation and obstacle avoidance. No UI dependencies.
2. Visual scene (`src/scene/`, `src/worlds/`): reusable furniture primitives, authored house, articulated character with Three AnimationMixer clips, destination docking and slow path-following. World descriptor supplies spatial data. Inspect actual rendered result.
3. Product shell (`src/App.tsx`, `src/styles.css`): sparse editorial chrome, anchored hotspots, accessible object cards, pause/time/camera controls, mock event demo, asset selection. Test actual browser interactions and responsive layout.
4. Integrate and review: runtime tests, TypeScript/build, browser smoke/visual QA, independent review. Fix concrete issues; write startup instructions, asset contract, limitations and evidence. Keep the local preview running; no remote publication.
