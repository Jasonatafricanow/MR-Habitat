import { createServer } from "vite";
const server = await createServer({ server: { middlewareMode: true } });
try {
  const { buildXiyueArt } = await server.ssrLoadModule(
    "/src/scene/XiyueSurface.tsx",
  );
  const art = buildXiyueArt(false);
  try {
    const groups = [
      art.shell,
      art.decor,
      art.sofa,
      art.coffee,
      ...art.objects.map((p) => p.model),
    ];
    const totals = {},
      byAssembly = {};
    let meshes = 0,
      triangles = 0;
    for (const g of groups) {
      byAssembly[g.name] = g.userData.inventory;
      for (const [key, count] of Object.entries(g.userData.inventory ?? {}))
        totals[key] = (totals[key] ?? 0) + count;
      g.traverse((o) => {
        if (o.isMesh) {
          meshes++;
          triangles += o.geometry.attributes.position.count / 3;
        }
      });
    }
    console.log(
      JSON.stringify({ totals, meshes, triangles, byAssembly }, null, 2),
    );
  } finally {
    art.dispose();
  }
} finally {
  await server.close();
}
