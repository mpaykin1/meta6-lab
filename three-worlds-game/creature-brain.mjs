import {hash,clamp} from './world-core.mjs';
export function biomeAt(x,z,y=Infinity,sea=3.8){return y<sea-.18?'water':x< -64?'ash':'island'}
export function lootPlacement(index,seed,original,height){
 if(index%3===0)return {...original,biome:'island'};
 const biome=index%3===1?'ash':'water';
 const x=biome==='ash'?-80-hash(index,1,seed)*32:72+hash(index,2,seed)*32;
 const z=biome==='ash'?16+hash(index,3,seed)*32:24+hash(index,4,seed)*32;
 return {x,z,y:height(x,z),near:false,biome};
}
function stableIdHash(id){
 let n=2166136261;
 for(const c of String(id)){n=Math.imul(n^c.codePointAt(0),16777619)}
 return n>>>0;
}
export function createBrain(id,home,seed=1337){
 const identity=stableIdHash(id);
 return {id,home:{...home},target:{...home},state:'idle',relation:'neutral',hp:50,clock:hash(identity,3,seed)*3,phase:hash(identity,7,seed)*6.28,decisions:0,seed,identity};
}
export function stepBrain(b,p,dt,context){
 dt=clamp(dt,0,.1);b.clock-=dt;b.phase+=dt;
 if(b.hp<=0){b.state='dead';return}
 const hero=context.player,d=Math.hypot(p.x-hero.x,p.z-hero.z);
 if(b.relation==='hostile'&&d<12){b.state='attack';b.target={x:hero.x,z:hero.z}}
 else if(b.relation==='friend'&&d>4&&d<25){b.state='follow';b.target={x:hero.x,z:hero.z}}
 else if(b.clock<=0){
  b.decisions++;b.clock=2+hash(b.decisions,b.identity,b.seed)*4;b.state=b.decisions%4?'wander':'idle';
  b.target={x:b.home.x+(hash(b.decisions,11,b.seed^b.identity)-.5)*12,z:b.home.z+(hash(b.decisions,19,b.seed^b.identity)-.5)*12};
 }
 if(b.state==='idle')return;
 const dx=b.target.x-p.x,dz=b.target.z-p.z,len=Math.hypot(dx,dz);
 if(len<.35){b.state='idle';return}
 const speed=(b.state==='attack'?1.5:.7)*dt, nx=p.x+dx/len*speed,nz=p.z+dz/len*speed;
 const floor=context.height(nx,nz);
 // Aquatic creatures do not walk onto land; all movement remains on collision terrain.
 if(!Number.isFinite(floor)||(context.aquatic&&floor>context.sea-1)){b.clock=0;b.state='idle';return}
 p.x=nx;p.z=nz;
 const targetY=context.aquatic?Math.min(context.sea-.6,floor+1.5):floor;
 p.y+=(targetY-p.y)*(1-Math.exp(-dt*4));
 b.heading=Math.atan2(dx,dz);
}
