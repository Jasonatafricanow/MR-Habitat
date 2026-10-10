import { expect, it } from "vitest";
import { buildXiyueArt } from "./XiyueSurface";
import { props } from "../worlds/xiyue";

it("caps repeated motifs in the actually generated art, with one open book at the nook", () => {
  const art = buildXiyueArt();
  try {
    const groups = [
      art.shell,
      art.decor,
      art.sofa,
      art.coffee,
      ...art.objects.map((p) => p.model),
    ];
    const totals: Record<string, number> = {};
    for (const g of groups)
      for (const [key, count] of Object.entries(g.userData.inventory))
        totals[key] = (totals[key] ?? 0) + Number(count);
    expect(totals.cups).toBe(3);
    expect(totals.plants).toBe(9);
    expect(totals.closedBooks).toBe(4);
    expect(totals.openBooks).toBe(1);
    expect(totals.entryDoors).toBe(1);
    expect(totals.balconyVistas).toBe(1);
    expect(totals.kettles).toBe(1);
    expect(totals.entryBenches).toBe(1);
    expect(totals.livingArmchairs).toBe(1);
    expect(
      art.objects.find((p) => p.id === "nook-table")!.model.userData.inventory
        .openBooks,
    ).toBe(1);
    expect(
      art.objects.find((p) => p.id === "entry-bench")!.model.userData.inventory
        .closedBooks ?? 0,
    ).toBe(0);
  } finally {
    art.dispose();
  }
});

it("uses the source's low entry bench and includes the missing living armchair", () => {
  expect(props.find((p) => p.id === "entry-bench")?.h).toBeLessThan(0.5);
  expect(props.some((p) => p.id === "entry-table")).toBe(false);
  expect(props.some((p) => p.id === "living-chair")).toBe(true);
});
