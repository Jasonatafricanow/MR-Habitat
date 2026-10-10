export interface CharacterAsset {
  id: string;
  name: string;
  coat: string;
  pants?: string;
  hat?: string;
  outfitStyle?: string;
  hair: string;
  skin: string;
}
export const characters: CharacterAsset[] = [
  {
    id: "mori",
    name: "Mori",
    coat: "#b88450",
    hair: "#514137",
    skin: "#e3bc95",
  },
  {
    id: "lumi",
    name: "Lumi",
    coat: "#708b80",
    hair: "#79624c",
    skin: "#efd1aa",
  },
];
