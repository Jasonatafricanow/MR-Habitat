# MR-Habitat
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

Early versions may contain only:

- a lightweight 3D environment;
- one movable character;
- basic ambient activities;
- speech-bubble projection;
- several interactive information objects;
- read-only projections from MR / Observation Window state.

The architecture should nevertheless remain open to future extensions such as custom characters, externally authored environments, richer spatial projections, multiple agents, remote presence, and other forms of interactive world representation.

The environment is a projection layer, not an authority layer.

Deleting or replacing a Habitat should never delete or redefine the cognition it represents.
## Design Direction

MR Habitat should remain:

- lightweight before feature-rich;
- world-agnostic rather than tied to one fixed room;
- character-agnostic rather than tied to one avatar format;
- read-oriented before write-oriented;
- projection-driven rather than cognition-owning;
- compatible with externally authored world and character assets;
- loosely coupled to Mind Runtime through a narrow adapter boundary.

The first milestone is not to build a virtual world.

It is to determine whether spatial presence is a useful extension of the MR Observation Window.
