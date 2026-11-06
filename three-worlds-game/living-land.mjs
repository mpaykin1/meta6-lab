// Stage 9 owner feedback: deterministic identity and density for EVERY surfaced
// offshore chunk. No new art: renderers consume ONLY the accepted Island's
// original tree voxels and the owner's existing Ash asset factory.
import {hash} from './world-core.mjs';
export const LAND_CHUNK=16, MIN_DRY_OBJECTS=4;
export function landBiomeAt(x,z,seed=1337){
 if(x<-40)return 'ash';
 if(x<64)return 'island';
 // All adjacent chunks of a seeded 220x220 offshore island share one identity.
 const gx=Math.round((x-145)/220),gz=Math.round((z-32)/220);
 return hash(gx+461,gz-117,seed)>0.58?'ash':'island';
}
export function planLivingLandChunk(cx,cz,seed,ground,sea=3.8){
 const x0=cx*LAND_CHUNK,z0=cz*LAND_CHUNK;
 const candidates=[];
 // 6x6 coverage ensures no surfaced voxel-size patch is missed.
 for(let dz=0;dz<8;dz++)for(let dx=0;dx<8;dx++){
  const x=x0+1+dx*2,z=z0+1+dz*2,y=ground(x,z);
  if(Number.isFinite(y)&&y>sea+.12)candidates.push({x,y,z});
 }
 if(!candidates.length)return {cx,cz,biome:null,objects:[],dry:0};
 const biome=landBiomeAt(x0+8,z0+8,seed);
 // A minimum of four already-approved props per surfaced chunk,
 // deterministic across revisits, all resting on the REAL collision floor.
 const objects=[];
 for(let i=0;i<Math.max(MIN_DRY_OBJECTS,Math.min(8,Math.ceil(candidates.length/8)));i++){
  const pick=Math.floor(hash(cx*37+i,cz*59-i,seed+17)*candidates.length);
  const p=candidates[pick],type=biome==='ash'?['dead_tree_a','wall_ruin','barrel','dead_tree_b','grave_cross','wreck_truck'][i%6]:'accepted_tree';
  objects.push({...p,type,heading:hash(cx*13+i,cz*31,seed)*Math.PI*2});
 }
 return {cx,cz,biome,objects,dry:candidates.length};
}
export function simulateGuestArrival(update,step=1/30,maxSeconds=60){
 let t=0;for(let i=0;i<Math.ceil(maxSeconds/step);i++){t+=step;update(step);if(update.active?.())return t;}
 return null;
}
