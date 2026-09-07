import type { ComponentType } from "react";
import type { AnimationClip } from "three";
import type { CharacterAsset } from "./catalog";
import type { ObjectId, WorldDefinition } from "../worlds/studio";

export interface CharacterVisualProps {
  asset: CharacterAsset;
  reading: boolean;
}
export interface CharacterPackage {
  id: string;
  Visual: ComponentType<CharacterVisualProps>;
  /** Semantic visual slots: idle, walk, working, reading, thinking, resting, sleeping. */
  clips: () => AnimationClip[];
}
export interface WorldSurfaceProps {
  night: boolean;
  autumn: boolean;
  onSelect: (id: ObjectId) => void;
  showLabels: boolean;
}
export interface WorldPackage {
  definition: WorldDefinition;
  Surface: ComponentType<WorldSurfaceProps>;
}
