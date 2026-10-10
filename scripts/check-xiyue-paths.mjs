import { createServer } from 'vite';
const server = await createServer({server:{middlewareMode:true},appType:'custom'});
const {buildHome, defaultLayout, interactionAnchors} = await server.ssrLoadModule('/src/worlds/xiyue.ts');
const {createNavigation}=await server.ssrLoadModule('/src/runtime/navigation.ts');
for(const layout of [defaultLayout,{...defaultLayout,sofa:{x:1.1,z:-1.1,rotation:-Math.PI/2+.1},coffee:{x:-.8,z:-1.05,rotation:Math.PI/2}}]){
 const w=buildHome(layout),nav=createNavigation({...w.bounds,obstacles:w.obstacles,clearance:.2,cellSize:w.navigationCellSize});
 console.log(JSON.stringify(Object.fromEntries(Object.entries(interactionAnchors(layout)).map(([id,a])=>[id,{walkable:nav.isWalkable(a.position),path:!!nav.findPath(w.spawn,a.position)}]))));
}
await server.close();
