import { describe, it, expect } from "vitest";
import { Group } from "three";
import { createAnimator } from "./characterRig";

function rig() {
  const root = new Group();
  for (const name of [
    "Torso",
    "Head",
    "ArmL",
    "ArmR",
    "LegL",
    "LegR",
    "ShinL",
    "ShinR",
  ]) {
    const node = new Group();
    node.name = name;
    root.add(node);
  }
  return root;
}
describe("visual pose transitions", () => {
  it("applies the destination pose with reduced loops instead of freezing the previous gait", () => {
    const root = rig(),
      animator = createAnimator(root);
    animator.play("walk");
    animator.update(0.6);
    animator.play("working");
    animator.update(0.016, true);
    expect(root.getObjectByName("ArmL")!.rotation.x).toBeCloseTo(-0.9, 3);
    expect(root.getObjectByName("LegL")!.rotation.x).toBeCloseTo(-1.25, 3);
    animator.update(0.2, true);
    expect(root.getObjectByName("ArmL")!.rotation.x).toBeCloseTo(-0.9, 3);
    animator.dispose();
  });
});
