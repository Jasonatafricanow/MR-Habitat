# SDD ledger — plan: docs/PLAN.md

Initial repository: empty, unborn master, no worktree history. Work proceeds locally in codex/habitat-vertical-slice; no remote action. User explicitly authorized design decisions and direct implementation.

| Work                 | Shared boundary / review                                                  | Status                                            |
| -------------------- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| Runtime / scene      | Activity enum, TTL, Point tuples, findPath excludes start/includes end    | Integrated                                        |
| Scene / shell        | Object IDs, activity, pause, speech, onMotion callbacks                   | Integrated                                        |
| Assets / scene       | WorldPackage Surface+definition, CharacterPackage Visual+clips            | Integrated; no import UI claimed                  |
| Runtime tests        | Malformed events, expired input, furniture clearance, disconnected routes | 25 initial tests passed                           |
| Motion tests         | Blocking, pause, docking and retargeting                                  | 6 tests passed                                    |
| Animation regression | Reduced-loop destination pose must apply                                  | Observed RED, then GREEN                          |
| Review               | Independent agent found 5 concrete P2 issues                              | All fixed; independent re-review clear            |
| Browser              | Desktop day/night and mobile 390x844 checked                              | Cards, focus, mock event, pause and zoom verified |

Ruling: retain a small code-level package seam and document importer limits; a new installer or builder would not improve this visual experiment.
Ruling: no worktree split in an empty repository; use the user-provided project directory and a feature branch.
Ruling: no remote publish / merge target exists. Keep local reviewable source and running preview.
