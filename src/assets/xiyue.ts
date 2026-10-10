import type { WorldPackage } from "./packages";
import { createElement } from "react";
import { XiyueSurface } from "../scene/XiyueSurface";
import { buildHome, defaultLayout, type Layout } from "../worlds/xiyue";

/** A fresh definition per instance; the shared shell is never mutated. */
export function createXiyuePackage(
  layout: Layout = defaultLayout,
): WorldPackage {
  const instanceLayout = structuredClone(layout);
  return {
    fixedShell: { schemaVersion: 1, kind: "procedural" },
    definition: buildHome(instanceLayout),
    Surface: (props) =>
      createElement(XiyueSurface, { ...props, layout: instanceLayout }),
  };
}
