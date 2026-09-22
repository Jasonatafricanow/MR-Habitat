# MR Habitat

**A spatial presence experiment for Mind Runtime.**

MR Habitat explores a product question that appears only after runtime state becomes inspectable:

> If a long-lived agent has persistent state and activity, can that state be perceived as presence rather than only as dashboards, logs, and text?

Habitat projects authored or runtime-derived state into a lightweight 3D environment. It does not own cognition, memory, identity, or the primary conversation.

## Portfolio role

```text
Mind Runtime
 runtime authority
      |
      v
Observation / projection data
      |
      v
MR Habitat
 spatial presence
```

Habitat extends the read-only idea behind Observation Window. It is a projection layer, not a second runtime.

## The problem

Traditional observability answers engineering questions:

- what state exists;
- which binding is active;
- what changed;
- what caused a transition.

That is useful for debugging, but it does not answer a product question:

> What does a persistent agent feel like when its continuity is visible in an ambient environment?

The temptation is to answer by building a virtual world platform. Habitat deliberately avoids that scope.

## How the design evolved

### 1. Observation Window established the read-only boundary

Mind Runtime already had a surface for state, telemetry, and causal inspection. That made "visibility" possible without giving the UI write authority.

### 2. The next question was presence, not more diagnostics

The experiment moved from panels toward spatial cues: movement, location, activity, objects, speech bubbles, day/night changes, and ambient routines.

### 3. Product scope was intentionally reduced

The first milestone is one lightweight environment with one stylized character and authored/mock events.

It does **not** attempt to solve:

- world creation;
- generic avatar systems;
- multiplayer;
- a new chat client;
- memory editing;
- cognition simulation.

The purpose is to test whether spatial presence adds useful perception before investing in platform complexity.

## Key design decisions

### Projection never owns cognition

Deleting or replacing a Habitat must not delete or redefine the state it visualizes.

### Read-oriented before write-oriented

The first product question is whether observation has value. Write actions are intentionally constrained until the projection model is proven useful.

### World and character are replaceable assets

The runtime should consume validated world / character packages rather than embedding cognition logic into one scene.

### Ambient behavior is not evidence

Local animation and routine make the environment legible; they must not feed back into MR as if they were cognitive events.

### Pause semantics are explicit

Pausing visuals freezes local activity timing, while externally authored event TTL continues according to real time.

## Architecture

```text
Authored / future MR projection input
               |
               v
        Projection adapter
               |
               v
      Habitat local state
 scene / character / camera / UI
               |
               v
 Three.js / React Three Fiber
               |
               v
        Observable presence
```

No cognition write path is required for the current prototype.

## Current prototype

The first version provides:

- one warm 3D room;
- a stylized character with several locations / activities;
- orbit, zoom, reset, pause, and day/night controls;
- read-only object interactions;
- authored external-event demonstrations;
- transient speech bubbles;
- low-intensity ambient routines;
- alternate visual presets;
- explicit hidden-page / pause timing behavior.

## Verification

```bash
npm ci
npm test
npm run build
npm run dev
```

Relevant project records:

- [design and technology choices](docs/DESIGN.md)
- [implementation plan](docs/PLAN.md)
- [asset consumption boundary](docs/ASSETS.md)
- [verification record](docs/VERIFICATION.md)
- [product experiment record](docs/product-experiment.md)

## Boundaries and non-claims

Habitat is currently:

- a local prototype;
- one room;
- one stylized character;
- mock/authored-event driven;
- not a real production MR client.

Generic GLB ingestion, automatic rig retargeting, a world editor, multiplayer, real mobile performance validation, and long-running production integration are outside the current delivered scope.

## Stack

React 19 · TypeScript · Vite · Three.js · React Three Fiber · Drei · three-pathfinding

## Repository history

Habitat was created as a bounded experiment after the Observation Window work. The repository records the prototype and its portfolio framing rather than claiming a mature virtual-world platform.

## Engineering philosophy

Build the smallest experiment that can invalidate the product idea.

If spatial presence is not useful, the architecture should make Habitat disposable without threatening the cognition system underneath it.
