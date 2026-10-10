# Xiyue structure restoration

**Goal:** Restore the supplied floor plan's room enclosure, entrance alignment, bed direction and bathroom arrangement before further decoration.
**Architecture:** Authored room, wall and fixture data determine both visuals and navigation. Projection bindings only follow existing furniture. The reference dimensions are approximate; topology takes precedence where the orthographic plan and perspective artwork differ.
**Tech stack:** Existing TypeScript, Three.js, Vitest; no dependencies or new decorative assets.
**Spec:** User's two attached Xiyue Home V1 drawings and structural correction request.

- [ ] Add failing structural regressions: aligned entrance/kitchen frontage; west-facing headboard; bathroom enclosure and fixture ordering.
- [ ] Correct `src/worlds/xiyue.ts`, rendering in `src/scene/xiyueArchitecture.ts` and `XiyueSurface.tsx`; relocate attached details and light consistently.
- [ ] Verify all activity paths and furniture placement, build, and inspect actual browser rendering and a north-up structural plan.
- [ ] Record what changed and remaining approximation in `docs/XIYUE_STRUCTURE_AUDIT.md`; supersede the inventory-only completion verdict.

Do not expand gameplay, animation or projection authority. Preserve pre-existing dirty work. No commit or publication is included.
