# From Observation Window to Habitat

## Hypothesis

Observation Window made runtime state inspectable through state views, logs,
telemetry, binding visibility, and causal traces. The next product question
was not “can we build a game?” It was:

> Can a long-running agent's state become perceptible as presence rather than
> only as data?

The hypothesis was deliberately narrow: a small spatial projection may make
continuity easier to notice while remaining separate from cognition authority.

## Prototype

Habitat is a standalone React, TypeScript, Three.js, and Vite visual prototype.
It provides one authored room, one active character, two visual appearances,
camera controls, day/evening presentation, object cards, mock events, speech
bubbles, pause behaviour, and a small asset/package consumption seam.

The data flow is:

```text
mock observation / authored event
        -> projection-only runtime state
        -> spatial scene, motion, and temporary UI
```

There is no chat surface, MR credential, production connection, memory store,
or cognition write interface. The room and cards are examples, not live MR
state.

## What Was Tested

The implementation was tested as a vertical slice rather than as a claim to a
complete world platform:

- 32 automated tests across 5 test files passed;
- malformed, future, expired, and ambient semantic inputs were covered;
- navigation covered obstacles, disconnected routes, and 49 studio spawn /
  anchor pairs at the authored clearance threshold;
- motion covered blocked state, pause, docking, retargeting, and bounded speed;
- the production build passed TypeScript and Vite checks;
- desktop and temporary 390 × 844 browser checks covered room framing,
  object-card focus, modal keyboard containment, mock events, pause, and camera
  reset;
- an independent review found five P2 issues, and the final re-review found no
  remaining important correctness issue in those fixes.

The full evidence is in [Verification](VERIFICATION.md). Representative
captures are [desktop](screenshots/desktop.png),
[evening](screenshots/evening.png), [mobile](screenshots/mobile.png), and the
[Xiyue home](screenshots/xiyue-home-v1.png) surface.

## What Failed or Was Reduced

The first product idea could easily have expanded into a virtual-world
platform: generic world import, multiple floors, autonomous character
behaviour, live MR state, and a new interaction surface. That would have made
the visual prototype responsible for much more than the hypothesis required.

During validation, five concrete issues exposed real interaction failures:
blocked arrival, reduced-motion pose freezing, camera zoom reset, modal focus
containment, and detached hotspot focus restoration. They were fixed because
they affected the vertical slice itself. No new world platform was added to
make the result look more complete.

The current visual layer also retains explicit limits: one room, one active
character, rectangular authored navigation, static example cards, mock
semantic events, and no mobile-device, FPS, battery, or long-duration stability
claim.

## What Changed

The architectural conclusion was:

```text
Telegram / Hermes / other clients -> primary interaction
Mind Runtime                    -> cognition authority and durable state
LCE                             -> longitudinal structure research
Habitat                         -> spatial presence projection
```

Creation remains flexible: assets and world packages can be authored outside
the runtime. Consumption remains conservative: Habitat validates a package,
projects it, and renders it. It does not build worlds, own cognition, rewrite
Memory, invent authority, or make a visual effect into evidence.

This is why Habitat is an experiment in product presence rather than a third
cognition system.

## What Was Deliberately Excluded

- live MR, Telegram, or Hermes integration;
- cognition writes or Memory storage;
- a primary chat surface;
- generic GLB importer and skeleton retargeting;
- world editor, arbitrary geometry collision, IK, multiplayer, and networking;
- claims about real device performance or long-running production stability.

These are not missing polish items. They are boundaries that keep the
prototype's result interpretable.

## Next Validation

The next useful validation is not “add more world.” It is to test whether a
small, read-oriented spatial projection improves human inspection of selected
runtime states without implying that the projection owns those states.

That can be tested with controlled synthetic inputs and explicit observation
criteria. A production binding would be a separate deployment and authority
decision, not an automatic consequence of this prototype.

## Current Status

Implemented and locally verified as a standalone visual vertical slice.
Research/product experiment, not a production MR client and not a cognition
engine.
