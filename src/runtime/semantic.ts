export type Activity =
  "idle" | "working" | "reading" | "resting" | "sleeping" | "thinking";
export interface PresenceEvent {
  id: string;
  agentId: string;
  activity: Activity;
  observedAt: number;
  expiresAt: number;
  speech?: string;
}
const activities: Activity[] = [
  "idle",
  "working",
  "reading",
  "resting",
  "sleeping",
  "thinking",
];

/** Local mock projection only: coordinates, animation commands and unknown fields never cross this boundary. */
export function acceptEvent(
  input: unknown,
  now: number,
  agentId: string,
): PresenceEvent | null {
  if (
    !Number.isFinite(now) ||
    !agentId ||
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  )
    return null;
  const value = input as Record<string, unknown>;
  if (
    typeof value.id !== "string" ||
    !value.id.trim() ||
    value.agentId !== agentId ||
    !activities.includes(value.activity as Activity) ||
    typeof value.observedAt !== "number" ||
    !Number.isFinite(value.observedAt) ||
    typeof value.expiresAt !== "number" ||
    !Number.isFinite(value.expiresAt) ||
    value.observedAt > now ||
    value.expiresAt <= now ||
    value.expiresAt <= value.observedAt ||
    (value.speech !== undefined &&
      (typeof value.speech !== "string" || value.speech.length > 180))
  )
    return null;
  return {
    id: value.id,
    agentId,
    activity: value.activity as Activity,
    observedAt: value.observedAt,
    expiresAt: value.expiresAt,
    ...(value.speech === undefined ? {} : { speech: value.speech as string }),
  };
}

export function selectActivity(
  event: PresenceEvent | null,
  now: number,
  ambient: Activity,
): { activity: Activity; source: "mock" | "ambient" } {
  const current = event && acceptEvent(event, now, event.agentId);
  return current
    ? { activity: current.activity, source: "mock" }
    : { activity: ambient, source: "ambient" };
}

/** Authored visual pacing, never an inference about the agent's cognition. */
export function ambientAt(seconds: number): Activity {
  const schedule: Activity[] = [
    "idle",
    "reading",
    "thinking",
    "resting",
    "working",
  ];
  if (!Number.isFinite(seconds) || seconds < 0) return "idle";
  return schedule[Math.floor(seconds / 28) % schedule.length];
}
