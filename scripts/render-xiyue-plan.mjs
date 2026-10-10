import { createServer } from 'vite';
import { writeFile } from 'node:fs/promises';
const server = await createServer({server:{middlewareMode:true},appType:'custom'});
try {
 const {floorPieces,rooms,walls,fixtures,props,defaultLayout} = await server.ssrLoadModule('/src/worlds/xiyue.ts');
 const sx=x=>440+x*65, sz=z=>380+z*65;
 const rect=(x,z,w,d,fill,stroke='none')=>`<rect x="${sx(x-w/2)}" y="${sz(z-d/2)}" width="${w*65}" height="${d*65}" fill="${fill}" stroke="${stroke}"/>`;
 const label=(x,z,t,size=13)=>`<text x="${sx(x)}" y="${sz(z)}" text-anchor="middle" font-size="${size}">${t}</text>`;
 const names={'bed':'床 · 床头←','wardrobe':'衣柜','shower':'淋浴','vanity':'洗手台','toilet':'马桶','counter':'灶台','sink':'洗槽','fridge':'冰箱','entry-bench':'长凳','desk':'书桌','books':'书架','living-books':'书架'};
 const chunks=[`<svg xmlns="http://www.w3.org/2000/svg" width="920" height="820" viewBox="0 0 920 820"><rect width="920" height="820" fill="#f3efe6"/><g font-family="Microsoft YaHei, sans-serif" fill="#363a32"><text x="55" y="45" font-size="25">Xiyue Home · 结构校正平面</text><text x="55" y="74" font-size="13">由当前场景坐标生成 · 北↑ · 墙线与碰撞共用数据 · 原图尺寸为近似值</text>`];
 for(const r of floorPieces) chunks.push(rect(r.x,r.z,r.w,r.d,['bathroom','kitchen'].includes(r.id)?'#cbd1c4':'#e1ceb0','#bbaa8f'));
 for(const p of [...fixtures,...props]) {
   chunks.push(rect(p.x,p.z,p.w,p.d,['shower','vanity','toilet','sink'].includes(p.id)?'#e9ede8':'#a7ad88','#69745d'));
   if(names[p.id]) chunks.push(label(p.x,p.z+.045,names[p.id],10));
 }
 for(const [id,t] of Object.entries(defaultLayout)) {
 const w=id==='sofa'?2.3:.85,d=id==='sofa'?.85:.55;
 chunks.push(`<g transform="translate(${sx(t.x)} ${sz(t.z)}) rotate(${-t.rotation*180/Math.PI})"><rect x="${-w*32.5}" y="${-d*32.5}" width="${w*65}" height="${d*65}" fill="#82906a" stroke="#526445"/></g>`);
 }
 for(const [x,z,w,d] of walls) chunks.push(rect(x,z,w,d,'#393e36'));
 for(const [x,z,dx,dz] of [[-1.6,-.3,0,1],[-2.8,1.45,0,.9],[.76,1.2,1.38,0],[-.9,4.2,1,0]]) chunks.push(`<path d="M ${sx(x-dx/2)} ${sz(z-dz/2)} L ${sx(x+dx/2)} ${sz(z+dz/2)}" stroke="#b97944" stroke-width="3" stroke-dasharray="5 3"/>`);
 for(const [x,z,name] of [[-3.4,-.25,'卧室'],[-3.45,2,'卫浴'],[-.8,2.72,'玄关'],[1.22,2.35,'厨房'],[3.8,.95,'书房'],[3.6,-1.65,'窗边'],[.15,.48,'客厅'],[0,-3.25,'阳台']])chunks.push(label(x,z,name,15));
 chunks.push(`<text x="55" y="735" font-size="14">校正：入口与厨房前沿对齐｜床头靠西｜卫浴东侧门洞｜洁具沿墙归位</text><text x="55" y="763" font-size="13">橙色虚线：门洞 / 入户门位置。低墙仅是剖切显示，不能作为通道。</text></g></svg>`);
 await writeFile('docs/screenshots/xiyue-structure-plan.svg',chunks.join('\n'));
 console.log('Wrote authored structure plan');
} finally { await server.close(); }
