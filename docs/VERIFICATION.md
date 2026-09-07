# Local verification — 2026-09-08

This is a standalone visual prototype, not an MR production acceptance.

## Automated

- `npm test`: **32 passing tests / 5 files**.
- Semantic tests: identity, malformed values, future and expired input, ambient fallback, projection-only fields.
- Navigation tests: obstacle and full-segment clearance, unavailable endpoints, disconnected floors. The actual studio fixture checks all **49 spawn / anchor pairs** at the scene's **0.2 m** clearance.
- Motion tests: persistent blocked state, paused transforms, bounded travel speed, complete undocking before travel, continuous interrupted docking, cloned state.
- Animation regression: observed failing reduced-motion pose transition, then passing. Reduced loops now sample the selected destination pose rather than freeze the previous gait.
- `npm run build`: TypeScript and Vite production build passed.
- Initial dependencies and final dependency removal both reported zero npm audit vulnerabilities at install time.

The first dense navigation integration assertion loop exceeded Vitest's 5-second timeout under concurrent browser/build load. The same 101 samples per segment are retained, now accumulating collision evidence before assertions rather than invoking a matcher for every sample/obstacle combination. The full rerun passed in 1.16 seconds; no timeout was increased and no route/sample was removed.

## Browser observations

Codex in-app browser on this Windows host; desktop viewport plus temporary **390 × 844** override, restored afterwards. Dev preview and production preview both opened successfully.

- Actual room, articulated character, daytime and lamplit evening visually inspected.
- Mobile room framing adjusted to avoid cutting off the diorama; no horizontal document overflow at 390 px.
- Object-bound bookshelf card opened; Escape dismissed it. DOM focus returned to `查看书架`.
- About modal kept Tab focus on its close button; Escape closed it and restored focus to `关于 Habitat`.
- Mock reading event produced a speech bubble and movement status in the production build.
- Pause displayed its paused state; transform freezing and continuation are covered by the motion tests.
- Camera reset now reapplies fitted zoom even after direct OrbitControls wheel zoom.
- Production camera check: the bookshelf pin moved from `(1153.04, 351.13)` to `(1159.79, 341.54)` after wheel zoom, then returned exactly to `(1153.04, 351.13)` after reset.
- Final production console inspection: **no error entries**, one upstream `THREE.Clock` deprecation warning.

## Independent review

A separate read-only reviewer found five P2 issues: blocked arrival, reduced-motion pose freezing, camera zoom reset, modal keyboard containment, and detached hotspot focus restoration. All five were fixed. Re-review found no remaining important correctness issue in those fixes, motion, or package integration; it independently reran 32 tests and TypeScript successfully. Visual judgments remain the parent agent's browser observations, not the reviewer's claim.

## Practical limits

- One world / one active character; two demo appearances and two palettes. No second floorplan claimed.
- World/character packages are code-level consumption seams. Generic GLB file import, validation, skeleton retargeting, editor and multi-agent networking are deferred.
- Static furniture / rectangular floor navigation. Authored docking deliberately enters the selected furniture footprint; arbitrary geometry collision and IK are not present.
- Only mock semantic events and static observation cards. No real MR, Telegram or Hermes connection, no cognition writes.
- Production Three/ecosystem chunk is about **1.11 MB minified / 309 KB gzip**; Vite emits its >500 KB chunk warning. It is retained transparently, not hidden by raising the warning threshold.
- The current upstream R3F/Three combination can emit `THREE.Clock` deprecation warnings. Runtime errors from intermediate HMR edits are not final-production evidence.
- Pixel ratio capped at 1.5, floorboards instanced, static contact shadow, and paused/background demand rendering reduce work. No FPS, battery, mobile-device or long-duration stability benchmark is claimed.

See `docs/screenshots/` for actual browser captures. Generated `dist/` is reproducible and ignored by Git.
