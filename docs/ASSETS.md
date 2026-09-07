# Tiny asset boundary, not a package standard

Habitat consumes a `WorldPackage` and a `CharacterPackage` (see `src/assets/packages.ts`). The built-in pair is registered in `src/assets/demo.ts`; the scene accepts replacement packages as props. The runtime does not construct houses, generate navigation paths itself, or change cognition.

## World

- `definition`: stable ID, display metadata, floor bounds, obstacle rectangles, spawn and activity anchors.
- `Surface`: React scene component. This can contain authored geometry or a GLB loaded with Drei `useGLTF` / Three `GLTFLoader`.
- Coordinates: meters, Y up, floor Y=0. An anchor has a walkable `position` and a facing angle in radians. Optional `dock` is an explicit world-space seat placement. Only the docking transition may enter that furniture's occupied region.
- The demo navigation adapter triangulates a rectangular floor conservatively around furniture, then delegates path search to three-pathfinding. It does not infer walkability from arbitrary imported meshes. Multi-floor / arbitrary floor shapes require an externally authored navmesh adapter.
- Three information slots (`desk`, `books`, `journal`) are intentionally demo-specific. Replace their content separately from visual geometry; there is no canonical data store in the scene.

## Character

- `Visual`: scene component rendered under a movable root. Put the feet at Y=0 and face +Z. The demo component accepts coat/hair/skin appearance and a temporary reading prop.
- `clips()`: fresh Three.js `AnimationClip` assets. Slots: `idle`, `walk`, `working`, `reading`, `thinking`, `resting`, `sleeping`. Missing slots fall back to idle. AnimationMixer handles interpolation and crossfades.
- A replacement GLB adapter can clone its scene (`SkeletonUtils.clone` for a skinned model), return it from `Visual`, and rename authored clip slots in its package. Model node names are internal to its own clips; Habitat does not require the demo toy's joints.
- Seating heights / offsets are authored for this demo's proportions. A differently sized character will require matching anchor dock and clip authoring; automatic retargeting, IK and collision-fitting are not delivered.

There is **no general-purpose file picker, GLB upload validation, downloadable package installer, world editor, or standardized third-party format in v0.1**. The seam exists in working source code, not as a claim that arbitrary files can already be imported. Local asset loading should be added with validation before exposing it to end users.

## Asset origin

All room meshes, furniture, character geometry, clips, window landscape and favicon are original procedural demo assets in this repository. No game assets, marketplace models, remote textures or external font service are used. Three.js, R3F, Drei, three-pathfinding, React and Lucide remain dependencies under their upstream licenses. An npm lockfile captures the resolved versions.
