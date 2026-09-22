# MR Habitat

MR Habitat is a small React/Three.js prototype for rendering agent activity and state in a 3D room.

The current version is intentionally limited: one environment, one stylized character, authored/mock events, and read-oriented interactions.

## Data flow

```text
authored event / future MR state
        |
        v
projection adapter
        |
        v
local UI state
        |
        v
React Three Fiber scene
```

Habitat does not write agent state back to Mind Runtime.

## Current prototype

The repository includes:

- one 3D room;
- a stylized character with several locations/activities;
- orbit/zoom/reset controls;
- pause behavior;
- day/night changes;
- read-only object interactions;
- transient speech bubbles;
- authored external-event demos;
- low-intensity ambient movement;
- alternate visual presets.

## Timing behavior

Visual pause and external event time are handled separately.

Pausing the scene freezes local activity timing, while externally authored event TTL continues according to real time. Hidden-page behavior is covered separately so returning to the tab does not silently rewrite event timing.

## Project structure

```text
React / UI
   |
   v
local state + projection adapter
   |
   v
React Three Fiber / Drei
   |
   v
Three.js scene + pathfinding
```

The scene and character are presentation assets. They do not contain memory/state logic from MR.

## Run

```bash
npm ci
npm test
npm run build
npm run dev
```

Project notes:

- [design and technology choices](docs/DESIGN.md)
- [implementation plan](docs/PLAN.md)
- [asset handling](docs/ASSETS.md)
- [verification record](docs/VERIFICATION.md)
- [product experiment notes](docs/product-experiment.md)

## Scope

This is not currently a production MR client, world editor, multiplayer system, generic avatar platform, or cognition simulator.

The prototype exists to answer a smaller question: whether persistent agent activity is useful when rendered as spatial presence.

## Stack

React 19 · TypeScript · Vite · Three.js · React Three Fiber · Drei · three-pathfinding
