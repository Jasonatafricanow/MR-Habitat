import { describe, expect, it } from "vitest";
import {
  acceptEvent,
  ambientAt,
  selectActivity,
  type PresenceEvent,
} from "./semantic";

const event: PresenceEvent = {
  id: "evt-1",
  agentId: "mori",
  activity: "reading",
  observedAt: 1000,
  expiresAt: 5000,
  speech: "A quiet page.",
};
describe("mock presence boundary", () => {
  it("accepts a current observation and projects only semantic fields", () => {
    const input = { ...event, position: [3, 0, 5], animation: "dance" };
    expect(acceptEvent(input, 2000, "mori")).toEqual(event);
    const accepted = acceptEvent(input, 2000, "mori")!;
    input.activity = "working";
    expect(accepted.activity).toBe("reading");
  });
  it.each([
    null,
    [],
    "reading",
    {},
    { ...event, id: "" },
    { ...event, agentId: "other" },
    { ...event, activity: "happy" },
    { ...event, observedAt: "1000" },
    { ...event, observedAt: NaN },
    { ...event, expiresAt: Infinity },
    { ...event, observedAt: 2001 },
    { ...event, expiresAt: 2000 },
    { ...event, expiresAt: 999 },
    { ...event, speech: 3 },
    { ...event, speech: "x".repeat(181) },
  ])("rejects malformed, expired, foreign, or future input %#", (input) => {
    expect(acceptEvent(input, 2000, "mori")).toBeNull();
  });
  it("rejects an invalid clock rather than pinning presence", () => {
    expect(acceptEvent(event, NaN, "mori")).toBeNull();
    expect(selectActivity(event, Infinity, "resting")).toEqual({
      activity: "resting",
      source: "ambient",
    });
  });
  it("switches back to explicitly ambient behavior at the expiry boundary", () => {
    expect(selectActivity(event, 4999, "resting")).toEqual({
      activity: "reading",
      source: "mock",
    });
    expect(selectActivity(event, 5000, "resting")).toEqual({
      activity: "resting",
      source: "ambient",
    });
    expect(selectActivity(null, 2000, "working")).toEqual({
      activity: "working",
      source: "ambient",
    });
  });
  it("keeps long deterministic dwell periods without interpreting observations", () => {
    expect(ambientAt(0)).toBe("idle");
    expect(ambientAt(27.99)).toBe("idle");
    expect(ambientAt(28)).toBe("reading");
    expect(ambientAt(55.99)).toBe("reading");
    expect(ambientAt(56)).toBe("thinking");
    expect(ambientAt(84)).toBe("resting");
    expect(ambientAt(112)).toBe("working");
    expect(ambientAt(140)).toBe("idle");
    expect(ambientAt(NaN)).toBe("idle");
    expect(ambientAt(-1)).toBe("idle");
  });
});
