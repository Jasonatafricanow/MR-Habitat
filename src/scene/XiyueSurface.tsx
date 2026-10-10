import { useEffect, useMemo } from "react";
import { Html } from "@react-three/drei";
import { Mesh } from "three";
import { FixedShell } from "./FixedShell";
import {
  fixtures,
  props,
  defaultLayout,
  homeScale,
  type Layout,
} from "../worlds/xiyue";
import type { WorldSurfaceProps } from "../assets/packages";
import { ArtBuilder, book, cup, createArtMaterials } from "./xiyueGeometry";
import { architecture, decorations } from "./xiyueArchitecture";
import { furnishing, fixture, seat } from "./xiyueFurnishings";
import { authoredInspectionSites } from "../worlds/xiyueSites";
import {
  resolveProjectionBindings,
  xiyueProjectionBindings,
} from "../runtime/xiyueBindings";
import type { ObjectId } from "../worlds/studio";

export function buildXiyueArt(night: boolean) {
  const palette = createArtMaterials();
  const build = (name: string, draw: (b: ArtBuilder) => void) => {
    const b = new ArtBuilder();
    draw(b);
    return b.finish(palette.materials, name);
  };
  const shell = build("FixedShell", (b) => {
    architecture(b, night);
    for (const p of fixtures)
      b.at([p.x, 0, p.z], [0, p.rotation ?? 0, 0], () =>
        fixture(b, p.id, p.w, p.d, p.h),
      );
  });
  const decor = build("RoomDetails", decorations);
  const objects = props.map((p) => ({
    id: p.id,
    model: build(p.id, (b) => {
      const bed = p.id === "bed";
      b.at([0, 0, 0], [0, p.rotation ?? 0, 0], () =>
        furnishing(b, p.id, bed ? p.d : p.w, bed ? p.w : p.d, p.h),
      );
    }),
    position: [p.x, 0, p.z] as [number, number, number],
  }));
  const sofa = build("sofa", (b) => seat(b, 2.3));
  const coffee = build("coffee", (b) => {
    b.ball(0, 0.26, 0, [0.37, 0.26, 0.23], "dark");
    b.box(0, 0.49, 0, 0.85, 0.09, 0.55, "oak", 0.14);
    for (let i = 0; i < 7; i++)
      b.box(
        -0.3 + i * 0.09,
        0.29,
        0.2,
        0.016,
        0.29 + (i % 2) * 0.06,
        0.03,
        "edge",
        0.009,
      );
    book(b, -0.17, 0.54, -0.025, 0.23, 0.28, "moss");
    cup(b, 0.2, 0.54, 0.01);
  });
  const all = [shell, decor, sofa, coffee, ...objects.map((p) => p.model)];
  return {
    shell,
    decor,
    sofa,
    coffee,
    objects,
    dispose: () => {
      all.forEach((group) =>
        group.traverse((o) => {
          if (o instanceof Mesh) o.geometry.dispose();
        }),
      );
      palette.dispose();
    },
  };
}

export function XiyueSurface({
  fixedShell,
  onSelect,
  showLabels,
  night,
  layout = defaultLayout,
  onWardrobe,
  projectionBindings = xiyueProjectionBindings,
}: WorldSurfaceProps & {
  layout?: Layout;
  onWardrobe?: () => void;
  projectionBindings?: Readonly<Record<string, ObjectId>>;
}) {
  const art = useMemo(() => buildXiyueArt(night), [night]);
  const views = resolveProjectionBindings(
    authoredInspectionSites(props),
    projectionBindings,
  );
  useEffect(() => () => art.dispose(), [art]);
  const marker = (
    id: "desk" | "books" | "journal" | "wardrobe",
    position: [number, number, number],
    label: string,
  ) => (
    <Html position={position} center zIndexRange={[20, 10]}>
      <button
        className="home-marker"
        aria-label={label}
        onClick={() => (id === "wardrobe" ? onWardrobe?.() : onSelect(id))}
      >
        {label}
      </button>
    </Html>
  );
  return (
    <>
      <FixedShell source={fixedShell}>
        <group scale={[homeScale, 1, homeScale]}>
          <primitive object={art.shell} dispose={null} />
        </group>
      </FixedShell>
      <group scale={[homeScale, 1, homeScale]} name="MovableProps">
        <primitive object={art.decor} dispose={null} />
        {art.objects.map((p) => (
          <group
            key={p.id}
            position={p.position}
            onClick={(e) => {
              const view = views.find(
                (v) => v.hostId === p.id && v.id.endsWith("-surface"),
              );
              if (view || p.id === "wardrobe") {
                e.stopPropagation();
                if (p.id === "wardrobe") onWardrobe?.();
                else if (view) onSelect(view.objectId);
              }
            }}
          >
            <primitive object={p.model} dispose={null} />
          </group>
        ))}
        <group
          position={[layout.sofa.x, 0, layout.sofa.z]}
          rotation={[0, layout.sofa.rotation, 0]}
        >
          <primitive object={art.sofa} dispose={null} />
        </group>
        <group
          position={[layout.coffee.x, 0, layout.coffee.z]}
          rotation={[0, layout.coffee.rotation, 0]}
        >
          <primitive object={art.coffee} dispose={null} />
        </group>
        {showLabels && (
          <>
            {views.map((view) => (
              <group key={view.id}>
                {marker(view.objectId, view.position, view.label)}
              </group>
            ))}
            {marker("wardrobe", [-1.99, 2.2, -2.55], "打开衣柜")}
          </>
        )}
      </group>
    </>
  );
}
