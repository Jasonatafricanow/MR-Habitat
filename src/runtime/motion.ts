import type { Point } from "./navigation";

export interface MotionAnchor {
  position: Point;
  facing: number;
  dock?: Point;
}
export interface MotionSnapshot {
  position: Point;
  facing: number;
  dockOffset: Point;
  moving: boolean;
  blocked: boolean;
  arrived: boolean;
}

type Phase = "arrived" | "undocking" | "walking" | "docking" | "blocked";
const distance = (a: Point, b: Point) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const zero = (): Point => [0, 0, 0];

/** Visual pacing only. Position follows a supplied navigation route; docking never changes that approach position. */
export function createMotion(spawn: Point) {
  let position: Point = [...spawn];
  let facing = 0;
  let dockOffset = zero();
  let phase: Phase = "arrived";
  let anchor: MotionAnchor = { position: [...spawn], facing: 0 };
  let route: Point[] = [];
  let routeIndex = 0;
  let transitionStart = zero();
  let transitionElapsed = 0;

  const snapshot = (): MotionSnapshot => ({
    position: [...position],
    facing,
    dockOffset: [...dockOffset],
    moving: phase === "walking",
    blocked: phase === "blocked",
    arrived: phase === "arrived",
  });

  function setTarget(nextAnchor: MotionAnchor, nextRoute: Point[] | null) {
    anchor = {
      position: [...nextAnchor.position],
      facing: nextAnchor.facing,
      ...(nextAnchor.dock ? { dock: [...nextAnchor.dock] as Point } : {}),
    };
    route = nextRoute?.map((point) => [...point] as Point) ?? [];
    routeIndex = 0;
    transitionStart = [...dockOffset];
    transitionElapsed = 0;
    // A failed path is terminal for this target, including when already visually docked.
    if (nextRoute === null) {
      phase = "blocked";
      return;
    }
    phase = distance(dockOffset, zero()) > 1e-8 ? "undocking" : "walking";
  }

  function turnToward(target: number, dt: number) {
    const delta = Math.atan2(
      Math.sin(target - facing),
      Math.cos(target - facing),
    );
    facing += delta * (1 - Math.exp(-5 * dt));
  }

  function interpolateOffset(target: Point, duration: number, dt: number) {
    transitionElapsed += dt;
    const progress = Math.min(1, transitionElapsed / duration);
    const smooth = progress * progress * (3 - 2 * progress);
    dockOffset = transitionStart.map(
      (value, axis) => value + (target[axis] - value) * smooth,
    ) as Point;
    if (progress >= 1) {
      dockOffset = [...target];
      return true;
    }
    return false;
  }

  function beginDocking() {
    // Never synthesize an unvalidated segment from a short/incomplete supplied route.
    if (distance(position, anchor.position) > 1e-6) {
      phase = "blocked";
      return;
    }
    transitionStart = [...dockOffset];
    transitionElapsed = 0;
    phase =
      anchor.dock && distance(anchor.dock, anchor.position) > 1e-8
        ? "docking"
        : "arrived";
  }

  function step(dt: number, paused: boolean): MotionSnapshot {
    if (paused || !Number.isFinite(dt) || dt <= 0 || phase === "blocked")
      return snapshot();
    dt = Math.min(0.05, dt);
    if (phase === "undocking") {
      if (interpolateOffset(zero(), 0.65, dt)) phase = "walking";
      return snapshot();
    }
    if (phase === "docking") {
      const offset = anchor.dock!.map(
        (value, axis) => value - anchor.position[axis],
      ) as Point;
      turnToward(anchor.facing, dt);
      if (interpolateOffset(offset, 0.75, dt)) phase = "arrived";
      return snapshot();
    }
    if (phase === "arrived") {
      turnToward(anchor.facing, dt);
      return snapshot();
    }

    let remaining = 0.72 * dt;
    while (routeIndex < route.length) {
      const next = route[routeIndex];
      const length = distance(position, next);
      if (length > 1e-8) {
        turnToward(
          Math.atan2(next[0] - position[0], next[2] - position[2]),
          dt,
        );
        const fraction = Math.min(1, remaining / length);
        position = position.map(
          (value, axis) => value + (next[axis] - value) * fraction,
        ) as Point;
        remaining -= Math.min(remaining, length);
        if (fraction < 1) break;
      }
      position = [...next];
      routeIndex++;
      if (remaining <= 1e-10) break;
    }
    if (routeIndex === route.length) beginDocking();
    return snapshot();
  }
  return { setTarget, step, snapshot };
}
