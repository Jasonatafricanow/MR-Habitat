import {
  AnimationClip,
  NumberKeyframeTrack,
  AnimationMixer,
  Group,
  LoopRepeat,
} from "three";

/** Clips are visual assets, not behavioral rules. Three.js owns interpolation/blending. */
export function makeClips() {
  const track = (name: string, times: number[], values: number[]) =>
    new NumberKeyframeTrack(name, times, values);
  const idle = new AnimationClip("idle", 4, [
    track("Torso.position[y]", [0, 2, 4], [0.85, 0.872, 0.85]),
    track("Head.rotation[z]", [0, 2, 4], [-0.025, 0.025, -0.025]),
    track("ArmL.rotation[x]", [0, 2, 4], [0.03, -0.03, 0.03]),
    track("ArmR.rotation[x]", [0, 2, 4], [-0.03, 0.03, -0.03]),
  ]);
  const walk = new AnimationClip("walk", 1.05, [
    track(
      "LegL.rotation[x]",
      [0, 0.2625, 0.525, 0.7875, 1.05],
      [0.36, 0, -0.36, 0, 0.36],
    ),
    track(
      "LegR.rotation[x]",
      [0, 0.2625, 0.525, 0.7875, 1.05],
      [-0.36, 0, 0.36, 0, -0.36],
    ),
    track("ArmL.rotation[x]", [0, 0.525, 1.05], [-0.29, 0.29, -0.29]),
    track("ArmR.rotation[x]", [0, 0.525, 1.05], [0.29, -0.29, 0.29]),
    track(
      "Torso.position[y]",
      [0, 0.2625, 0.525, 0.7875, 1.05],
      [0.85, 0.88, 0.85, 0.88, 0.85],
    ),
    track("Head.rotation[z]", [0, 0.525, 1.05], [0.03, -0.03, 0.03]),
  ]);
  const reading = new AnimationClip("reading", 4, [
    track("ArmL.rotation[x]", [0, 2, 4], [-1.02, -0.96, -1.02]),
    track("ArmR.rotation[x]", [0, 2, 4], [-1.05, -0.98, -1.05]),
    track("Head.rotation[x]", [0, 2, 4], [0.18, 0.24, 0.18]),
    track("Torso.position[y]", [0, 2, 4], [0.85, 0.86, 0.85]),
  ]);
  const working = new AnimationClip("working", 1.4, [
    track("Torso.position[y]", [0, 1.4], [0.91, 0.91]),
    track("LegL.rotation[x]", [0, 1.4], [-1.25, -1.25]),
    track("LegR.rotation[x]", [0, 1.4], [-1.25, -1.25]),
    track("ShinL.rotation[x]", [0, 1.4], [1.4, 1.4]),
    track("ShinR.rotation[x]", [0, 1.4], [1.4, 1.4]),
    track(
      "ArmL.rotation[x]",
      [0, 0.35, 0.7, 1.05, 1.4],
      [-0.9, -1, -0.9, -1, -0.9],
    ),
    track(
      "ArmR.rotation[x]",
      [0, 0.35, 0.7, 1.05, 1.4],
      [-1, -0.9, -1, -0.9, -1],
    ),
    track("Head.rotation[x]", [0, 0.7, 1.4], [0.1, 0.16, 0.1]),
  ]);
  const thinking = new AnimationClip("thinking", 6, [
    track("Head.rotation[y]", [0, 2, 4, 6], [-0.15, 0.12, 0.2, -0.15]),
    track("Head.rotation[x]", [0, 3, 6], [-0.1, -0.04, -0.1]),
    track("Torso.position[y]", [0, 3, 6], [0.85, 0.875, 0.85]),
  ]);
  const resting = new AnimationClip("resting", 5, [
    track("Head.rotation[z]", [0, 2.5, 5], [-0.12, -0.05, -0.12]),
    track("Torso.position[y]", [0, 2.5, 5], [0.84, 0.86, 0.84]),
  ]);
  const sleeping = new AnimationClip("sleeping", 5, [
    track("Head.rotation[x]", [0, 2.5, 5], [0.3, 0.36, 0.3]),
    track("Head.rotation[z]", [0, 2.5, 5], [0.12, 0.15, 0.12]),
    track("Torso.position[y]", [0, 2.5, 5], [0.83, 0.85, 0.83]),
  ]);
  for (const clip of [reading, resting, sleeping]) {
    // Sofa poses dock at an authored seat, independently of navmesh approach coordinates.
    clip.tracks = clip.tracks.filter((t) => t.name !== "Torso.position[y]");
    clip.tracks.push(
      track("Torso.position[y]", [0, clip.duration], [1.07, 1.08]),
    );
    for (const side of ["L", "R"]) {
      clip.tracks.push(
        track(`Leg${side}.rotation[x]`, [0, clip.duration], [-1.3, -1.3]),
      );
      clip.tracks.push(
        track(`Shin${side}.rotation[x]`, [0, clip.duration], [1.35, 1.35]),
      );
    }
  }
  return [idle, walk, reading, working, thinking, resting, sleeping];
}

export function createAnimator(root: Group, clips = makeClips()) {
  const mixer = new AnimationMixer(root);
  const actions = Object.fromEntries(
    clips.map((clip) => [
      clip.name,
      mixer.clipAction(clip).setLoop(LoopRepeat, Infinity),
    ]),
  );
  let current = actions.idle ?? Object.values(actions)[0];
  current?.play();
  return {
    update(delta: number, reduced = false) {
      if (reduced && current) {
        for (const action of Object.values(actions)) {
          if (action !== current) action.stop();
        }
        current.stopFading().setEffectiveWeight(1);
        current.time = 0;
        mixer.update(0);
      } else mixer.update(delta);
    },
    play(name: string) {
      const next = actions[name] ?? actions.idle;
      if (!next || next === current) return;
      next.reset().fadeIn(0.55).play();
      current?.fadeOut(0.55);
      current = next;
    },
    dispose() {
      mixer.stopAllAction();
      mixer.uncacheRoot(root);
    },
  };
}
