import type { ObjectId } from "../worlds/studio";
import type { InspectionSite } from "../worlds/xiyueSites";

/** Only content keys. Bindings cannot author hosts, positions, sizes or furniture. */
export const xiyueProjectionBindings: Readonly<Record<string, ObjectId>> =
  Object.freeze({
    "desk-surface": "desk",
    "desk-notebook": "journal",
    "books-surface": "books",
  });
export function resolveProjectionBindings(
  sites: readonly InspectionSite[],
  bindings: Readonly<Record<string, ObjectId>>,
) {
  return sites.flatMap((site) => {
    const objectId = bindings[site.id];
    return objectId
      ? [
          {
            ...site,
            position: [...site.position] as [number, number, number],
            objectId,
          },
        ]
      : [];
  });
}
