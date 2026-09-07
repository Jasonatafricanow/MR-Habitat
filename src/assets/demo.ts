import { Room } from "../scene/Room";
import { Toy } from "../scene/Character";
import { makeClips } from "../scene/characterRig";
import { studio } from "../worlds/studio";
import type { CharacterPackage, WorldPackage } from "./packages";
export const paperwood: WorldPackage = { definition: studio, Surface: Room };
export const woodenCompanion: CharacterPackage = {
  id: "wooden-companion",
  Visual: Toy,
  clips: makeClips,
};
