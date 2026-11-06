// Shared deterministic terrain and lifecycle. No renderer, DOM or network dependencies.
export const CHUNK_SIZE = 16;
// The accepted island and western ash extension own the surface; east of x=64 is seabed.
export const usesSurfaceTerrain = (x,z) => x < 64;
export const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
export const isOriginalIslandCell = (x,z)=>x>=0&&x<64&&z>=0&&z<64;
const smooth = x => {x=clamp(x,0,1);return x*x*(3-2*x)};
export function hash(x,z,s=0){let n=Math.imul(x|0,374761393)^Math.imul(z|0,668265263)^Math.imul(s|0,362437);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296}
function noise(x,z,s){const a=Math.floor(x),b=Math.floor(z),u=smooth(x-a),v=smooth(z-b);return (hash(a,b,s)*(1-u)+hash(a+1,b,s)*u)*(1-v)+(hash(a,b+1,s)*(1-u)+hash(a+1,b+1,s)*u)*v}
export function islandHeight(x,z,seed=1337){
 const wx=x+9*(noise(x*.018,z*.018,seed)-.5),wz=z+9*(noise(z*.018,x*.018,seed+1)-.5);
 const hills=(noise(wx*.035,wz*.035,seed+2)-.5)*9;
 const ridge=(1-Math.abs(noise(wx*.075,wz*.075,seed+3)*2-1))*2.5;
 // A nonzero periodic component prevents cancellation of all terrain octaves.
 return 4+hills+ridge+3.2*(noise(wx*.18,wz*.18,seed+17)-.5);
}
export function ashHeight(x,z,seed=1337){
 const dunes=4.6*(noise(x*.14,z*.12,seed+7)-.5)+2.2*(noise(x*.07,z*.17,seed+9)-.5);
 const ridge=3*(1-Math.abs(noise(x*.05,z*.05,seed+20)*2-1));
 const crater=Math.exp(-((x+118)**2+(z-34)**2)/140)*3;
 return 8+dunes+ridge-crater;
}
export function waterHeight(x,z,seed=1337){
 const depth=clamp((x-64)/28,0,1),ridge=5*(noise(x*.10,z*.12,seed+38)-.5);
 return 1-depth*(8+3*noise(x*.06,z*.06,seed+31))+depth*ridge+1.1*(noise(x*.25,z*.23,seed+42)-.5);
}
export function createHeightSource(seed,core){
 // Preserve the accepted core, including its constructed plaza and shoreline.
 // Outside, blend from the exact boundary sample into the same seeded extension.
 return (x,z)=>{
  if(isOriginalIslandCell(x,z))return core(Math.floor(x),Math.floor(z));
  const bx=clamp(x,0,64),bz=clamp(z,0,64),distance=Math.hypot(x-bx,z-bz);
  const edge=core(Math.min(63,Math.floor(bx)),Math.min(63,Math.floor(bz))),t=smooth(distance/20);
  let extension=islandHeight(x,z,seed);
  if(x<0){const a=smooth((-x-20)/40);extension=extension*(1-a)+ashHeight(x,z,seed)*a;}
  if(x>=64){const a=smooth((x-64)/12);extension=extension*(1-a)+waterHeight(x,z,seed)*a;}
  return edge*(1-t)+extension*t;
 };
}
export class ChunkWindow {
 constructor({radius=2,create,dispose}){this.radius=radius;this.create=create;this.dispose=dispose;this.items=new Map();this.key=''}
 update(x,z){const cx=Math.floor(x/16),cz=Math.floor(z/16),key=cx+','+cz;if(key===this.key)return;this.key=key;const keep=new Set();
  for(let dz=-this.radius;dz<=this.radius;dz++)for(let dx=-this.radius;dx<=this.radius;dx++)keep.add((cx+dx)+','+(cz+dz));
  // Evict before allocate: the cap is respected even during a teleport.
  for(const [k,v] of this.items)if(!keep.has(k)){this.dispose(v);this.items.delete(k)}
  for(const k of keep)if(!this.items.has(k)){const [a,b]=k.split(',').map(Number);this.items.set(k,this.create(a,b))}
 }
 clear(){for(const v of this.items.values())this.dispose(v);this.items.clear();this.key=''}
}
export class WorldManager {
 constructor(){this.worlds=new Map();this.positions=new Map();this.active=null;this.transition=null;this.fade=0}
 register(id,world){if(this.worlds.has(id))throw Error('Duplicate world '+id);this.worlds.set(id,world)}
 async enter(id,position){const next=this.worlds.get(id);if(!next)throw Error('Unknown world '+id);if(this.transition)throw Error('Transition busy');
  this.transition=id;try{await next.init?.(position||this.positions.get(id));if(this.active&&this.active!==id)await this.worlds.get(this.active).dispose?.();this.active=id;this.fade=1}finally{this.transition=null}}
 update(dt,position){if(this.active){this.positions.set(this.active,{x:position.x,y:position.y,z:position.z});this.worlds.get(this.active).update?.(dt,position)}this.fade=Math.max(0,this.fade-dt*1.8)}
 dispose(){if(this.active)this.worlds.get(this.active).dispose?.();this.active=null;this.positions.clear()}
}
