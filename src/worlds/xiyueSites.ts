export interface InspectionSite {
  id: string;
  hostId: string;
  label: string;
  position: [number, number, number];
}
/** Authored art attachment points, independent of projections and their availability. */
export function authoredInspectionSites(
  furniture: readonly { id: string; x: number; z: number }[],
): InspectionSite[] {
  const sites = [
    {
      id: "desk-surface",
      hostId: "desk",
      label: "工作桌",
      offset: [-0.12, 1.62, -0.5],
    },
    {
      id: "desk-notebook",
      hostId: "desk",
      label: "手记",
      offset: [-0.08, 1.05, 0.5],
    },
    {
      id: "books-surface",
      hostId: "books",
      label: "书架",
      offset: [0, 1.95, 0],
    },
  ];
  return sites.flatMap((site) => {
    const host = furniture.find((p) => p.id === site.hostId);
    return host
      ? [
          {
            id: site.id,
            hostId: site.hostId,
            label: site.label,
            position: [
              host.x + site.offset[0],
              site.offset[1],
              host.z + site.offset[2],
            ] as [number, number, number],
          },
        ]
      : [];
  });
}
