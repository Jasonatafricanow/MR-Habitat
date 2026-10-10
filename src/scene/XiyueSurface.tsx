import { useEffect, useMemo } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BackSide,
  Color,
  Group,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import { FixedShell } from "./FixedShell";
import {
  fixtures,
  props,
  rooms,
  defaultLayout,
  homeScale,
  type Layout,
} from "../worlds/xiyue";
import type { WorldSurfaceProps } from "../assets/packages";
import { ArtBuilder, book, cup, createArtMaterials } from "./xiyueGeometry";
import {
  cutsAway,
  decorations,
  floors,
  wallAssemblies,
} from "./xiyueArchitecture";
import { exterior, exteriorTrees } from "./xiyueExterior";
import { furnishing, fixture, seat } from "./xiyueFurnishings";
import { authoredInspectionSites } from "../worlds/xiyueSites";
import {
  resolveProjectionBindings,
  xiyueProjectionBindings,
} from "../runtime/xiyueBindings";
import type { ObjectId } from "../worlds/studio";

/** Room signage from the Xiyue cutaway board; nudges keep tags clear of the object markers. */
const roomTags: Record<
  string,
  { title: string; note?: string; dx?: number; dz?: number }
> = {
  balcony: { title: "Balcony", note: "Wind, plants, and a wider tomorrow." },
  nook: { title: "Daydreaming", dz: 0.35 },
  study: { title: "Work / Reading", dx: -0.55, dz: 0.75 },
  living: { title: "Staying", dx: -0.3, dz: 0.55 },
  bedroom: { title: "Rest", dx: 0.3, dz: 0.2 },
  bathroom: { title: "Bathing", dx: 0.25, dz: 0.45 },
  entry: { title: "Returning", dx: 0.2, dz: 0.15 },
  kitchen: { title: "Daily Warmth", dx: -0.2, dz: -0.2 },
};

export const skyTones = {
  day: { top: "#9fbdd0", horizon: "#f1e3c6" },
  night: { top: "#141c2c", horizon: "#3d4655" },
};
/** Gradient dome: cheap, fog-free, and matches the horizon to scene fog. */
function createSky() {
  const material = new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new Color(skyTones.day.top) },
      horizon: { value: new Color(skyTones.day.horizon) },
    },
    vertexShader: `varying float h;
      void main() {
        h = normalize(position).y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; varying float h;
      void main() {
        gl_FragColor = vec4(mix(horizon, top, smoothstep(-0.02, 0.45, h)), 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new Mesh(new SphereGeometry(190, 32, 16), material);
  mesh.name = "Sky";
  mesh.renderOrder = -1;
  return mesh;
}

type Art = ReturnType<typeof buildXiyueArt>;
type WallGroups = Art["walls"];
const origin = new Vector3();
/** Re-evaluates which walls face the camera every frame; cheap (32 segments). */
function Cutaway({ walls, trees }: { walls: WallGroups; trees: Art["trees"] }) {
  const controls = useThree((s) => s.controls) as unknown as {
    target: Vector3;
  } | null;
  useFrame(({ camera }) => {
    const t = controls?.target ?? origin;
    const dx = camera.position.x - t.x,
      dz = camera.position.z - t.z;
    const len = Math.hypot(dx, dz);
    for (const w of walls) {
      const cut = len > 1e-3 && cutsAway(w.rect, dx / len, dz / len);
      w.full.visible = !cut;
      w.cut.visible = cut;
    }
    // Hide trees standing on the sight line between camera and house.
    for (const tree of trees) {
      const ax = tree.x - t.x,
        az = tree.z - t.z;
      const along = len > 1e-3 ? (ax * dx + az * dz) / len : 0;
      const across = Math.abs(ax * dz - az * dx) / Math.max(len, 1e-3);
      tree.group.visible = !(
        along > 2 &&
        along < len + 2 &&
        across < tree.radius + 1.6
      );
    }
  });
  return null;
}

export function buildXiyueArt() {
  const palette = createArtMaterials();
  const build = (name: string, draw: (b: ArtBuilder) => void) => {
    const b = new ArtBuilder();
    draw(b);
    return b.finish(palette.materials, name);
  };
  const shell = build("FixedShell", (b) => {
    floors(b);
    for (const p of fixtures)
      b.at([p.x, 0, p.z], [0, p.rotation ?? 0, 0], () =>
        fixture(b, p.id, p.w, p.d, p.h),
      );
  });
  const walls = wallAssemblies().map((w, i) => {
    const full = w.full.finish(palette.materials, `wall-${i}`);
    const cut = w.cut.finish(palette.materials, `wall-${i}-cut`);
    cut.visible = false;
    const group = new Group();
    group.add(full, cut);
    return { rect: w.rect, group, full, cut };
  });
  const decor = build("RoomDetails", decorations);
  const outside = build("Exterior", exterior);
  const trees = exteriorTrees().map((t, i) => ({
    x: t.x * homeScale,
    z: t.z * homeScale,
    radius: t.radius * homeScale,
    group: build(`tree-${i}`, t.draw),
  }));
  // Shadow budget: ground only receives; only trees near the house cast.
  outside.traverse((o) => (o.castShadow = false));
  for (const t of trees)
    if (Math.hypot(t.x, t.z) > 15)
      t.group.traverse((o) => (o.castShadow = false));
  const sky = createSky();
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
  const all = [
    shell,
    decor,
    outside,
    sofa,
    coffee,
    ...walls.map((w) => w.group),
    ...trees.map((t) => t.group),
    ...objects.map((p) => p.model),
  ];
  return {
    shell,
    walls,
    trees,
    outside,
    sky,
    decor,
    sofa,
    coffee,
    objects,
    /** Night recolours the sky dome; geometry is never rebuilt. */
    setNight: (night: boolean) => {
      const tone = night ? skyTones.night : skyTones.day;
      sky.material.uniforms.top.value.set(tone.top);
      sky.material.uniforms.horizon.value.set(tone.horizon);
    },
    dispose: () => {
      sky.geometry.dispose();
      sky.material.dispose();
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
  const art = useMemo(() => buildXiyueArt(), []);
  useEffect(() => {
    art.setNight(night);
  }, [art, night]);
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
          {art.walls.map((w) => (
            <primitive key={w.group.uuid} object={w.group} dispose={null} />
          ))}
        </group>
        <Cutaway walls={art.walls} trees={art.trees} />
      </FixedShell>
      <primitive object={art.sky} dispose={null} />
      <group scale={[homeScale, 1, homeScale]} name="Exterior">
        <primitive object={art.outside} dispose={null} />
      </group>
      <group name="Trees" scale={[homeScale, 1, homeScale]}>
        {art.trees.map((tree) => (
          <primitive key={tree.group.uuid} object={tree.group} dispose={null} />
        ))}
      </group>
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
        {showLabels &&
          rooms.map((r) => {
            const tag = roomTags[r.id];
            if (!tag) return null;
            return (
              <Html
                key={r.id}
                position={[r.x + (tag.dx ?? 0), 0.9, r.z + (tag.dz ?? 0)]}
                center
                zIndexRange={[9, 0]}
                style={{ pointerEvents: "none" }}
              >
                <div className="room-tag" lang="en">
                  <b>{tag.title}</b>
                  {tag.note && <small>{tag.note}</small>}
                </div>
              </Html>
            );
          })}
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
