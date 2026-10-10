import type { ObjectId } from "../worlds/studio";
import { observations } from "./mockObservations";
export interface ProjectionProvider {
  read(
    worldId: string,
    objectId: ObjectId,
  ): Readonly<(typeof observations)[ObjectId]>;
}
export const mockProjectionProvider: ProjectionProvider = {
  read: (_worldId, objectId) => structuredClone(observations[objectId]),
};
