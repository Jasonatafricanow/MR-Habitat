export const outfits = [
  {
    id: "moss",
    name: "苔绿日常",
    coat: "#70815c",
    pants: "#474b39",
    hat: "#a4946e",
    style: "everyday",
  },
  {
    id: "clay",
    name: "陶土围裙",
    coat: "#b66443",
    pants: "#443b35",
    hat: "#c6ac71",
    style: "apron",
  },
  {
    id: "night",
    name: "靛蓝家居",
    coat: "#667994",
    pants: "#9daac0",
    hat: "#667994",
    style: "sleepwear",
  },
] as const;
export type Outfit = (typeof outfits)[number];
export function chooseOutfit(current: string, night: boolean): Outfit {
  const preferred = night ? outfits[2] : outfits[0];
  return preferred.id !== current
    ? preferred
    : outfits.find((o) => o.id !== current)!;
}
