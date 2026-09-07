# MR Habitat 0.1 — 午后的纸木小屋

Presence Surface: a small inhabited spatial observation window. Interaction remains in Telegram/Hermes; cognition remains in MR. This standalone prototype uses mock events only. There is no MR URL, credential, backend, chat input, or cognition mutation API.

## Visual slice

An orthographic cutaway diorama, warm wood, sage upholstery, collected books, plants, a lived-in desk, a small original articulated toy character. Room occupies the canvas. Three object-bound information cards, occasional speech, ambient dwell periods, slow walking, furniture-specific poses. Day/evening, orbit/zoom/reset, pause, reduced motion, optional mock-event controls. A second local palette/character selection proves visual state can change independently of observations.

## Technical decision

React 19 + R3F 9 + Three.js + Drei; no fork. Three.js owns rendering, geometry, animation mixing and glTF. Drei owns orbit controls and anchored HTML. three-pathfinding owns route search on authored walkable floor triangles. Habitat owns semantic-event expiry, activity selection, anchor selection, and visual pacing. No physics or builder. React state handles the small UI; per-frame transforms stay outside React renders.

Upstream references checked 2026-09-08:

- https://r3f.docs.pmnd.rs/ — renderer and React version compatibility.
- https://github.com/donmccurdy/three-pathfinding — consumes BufferGeometry navmesh, Y-up.
- https://developer.playcanvas.com/user-manual/react/ — viable alternative; a full game engine is unnecessary for this slice.
- https://github.com/isaac-mason/recast-navigation-js — runtime navmesh generation is deferred until imported geometry needs it.

## Boundaries and assets

Semantic input has agent identity, activity, event identity, observation time, expiry and optional speech; no coordinates or animation IDs. Ambient is explicitly visual, never evidence. World descriptors define obstacles and named activity anchors. Character descriptors select a renderer or a self-contained GLB and animation names; demo art is original geometry, replaceable independently. External package documentation is deliberately small. No canonical knowledge persistence. Local preferences may persist; projected mock information is immutable demo content.

## Acceptance

Build and typecheck; real navigation routes avoid furniture, blocked routes fail closed; expired/invalid semantic input cannot pin the character; stable ambient dwell times; cards close with Escape; pause stops visual simulation; visual inspection in a real browser at desktop/mobile dimensions; no browser errors. Do not label this a real MR integration, production package standard, fully rigged human, or device performance certification.
