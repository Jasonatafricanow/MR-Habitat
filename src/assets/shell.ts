/** Visual source only. Coordinates are authored in world metres, Y up.
 * Bounds, rooms, navigation, anchors and environment remain in WorldDefinition.
 * Procedural geometry is supplied by the renderer, never serialized here.
 */
export type FixedShellSource =
  | { schemaVersion: 1; kind: "procedural" }
  | { schemaVersion: 1; kind: "glb"; uri: string };

export const proceduralShell = {
  schemaVersion: 1,
  kind: "procedural",
} as const satisfies FixedShellSource;
