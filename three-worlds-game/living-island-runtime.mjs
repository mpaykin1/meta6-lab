// Draw only genuine voxel shapes extracted from the owner's accepted Island trees.
// Ash chunks are supplied by the existing Ash World factory (ash-world.mjs).
import {planLivingLandChunk,landBiomeAt,LAND_CHUNK} from './living-land.mjs';
export function createLivingIsland({THREE,scene,world,material,height,sea,seed,faces,faceTiles,blocks,W,D,H}){
 const tree=world.trees.find(t=>t.x>=3&&t.x<W-3&&t.z>=3&&t.z<D-3);
 if(!tree)throw Error('Accepted island has no source tree voxel data');
 const P=[],N=[],UV=[],COL=[],CUT=[],IX=[];
 const get=(x,y,z)=>x<0||x>=W||z<0||z>=D||y<0||y>=H?0:world.vox[x+W*(z+D*y)];
 let nv=0;
 for(let y=tree.h;y<=Math.min(H-1,tree.h+tree.th+3);y++)for(let z=tree.z-2;z<=tree.z+2;z++)for(let x=tree.x-2;x<=tree.x+2;x++){
  const id=get(x,y,z);
  if(id!==blocks.BARK&&id!==blocks.LEAVES)continue;
  const tiles=faceTiles[id];
  for(const f of faces){
   if([blocks.BARK,blocks.LEAVES].includes(get(x+f.n[0],y+f.n[1],z+f.n[2])))continue;
   const tile=f.k===0?tiles[0]:f.k===2?tiles[2]:tiles[1];
   const u0=(tile%4)*.25+.0006,v0=1-(Math.floor(tile/4)+1)/3+.0006,du=.25-.0012,dv=1/3-.0012;
   for(let k=0;k<4;k++){const v=f.v[k];
    P.push(x-tree.x+v[0],y-tree.h+v[1],z-tree.z+v[2]);
    N.push(...f.n);UV.push(u0+f.uv[k][0]*du,v0+f.uv[k][1]*dv);
    COL.push(.88,.96,.82);CUT.push(id===blocks.LEAVES?1:0);
   }
   IX.push(nv,nv+1,nv+2,nv,nv+2,nv+3);nv+=4;
  }
 }
 if(!IX.length)throw Error('Original island tree source is empty');
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
 geometry.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(COL,3));
 geometry.setAttribute('aCut',new THREE.Float32BufferAttribute(CUT,1));
 geometry.setIndex(IX);geometry.computeBoundingSphere();
 const groups=new Map(),radius=2;
 const mat=new THREE.Matrix4(),q=new THREE.Quaternion(),rot=new THREE.Euler(),size=new THREE.Vector3(),pos=new THREE.Vector3();
 const isAcceptedCore=(cx,cz)=>cx>=0&&cx<4&&cz>=0&&cz<4;
 function update(){
  const px=windowPosition().x,pz=windowPosition().z,cx=Math.floor(px/LAND_CHUNK),cz=Math.floor(pz/LAND_CHUNK),keep=new Set();
  for(let dz=-radius;dz<=radius;dz++)for(let dx=-radius;dx<=radius;dx++){
   const a=cx+dx,b=cz+dz,key=a+','+b;
   if(!isAcceptedCore(a,b)&&landBiomeAt(a*16+8,b*16+8,seed)==='island')keep.add(key);
  }
  for(const [k,m] of groups)if(!keep.has(k)){scene.remove(m);m.dispose?.();groups.delete(k);}
  for(const key of keep)if(!groups.has(key)){
   const [a,b]=key.split(',').map(Number),plan=planLivingLandChunk(a,b,seed,height,sea);
   if(!plan.objects.length)continue;
   const m=new THREE.InstancedMesh(geometry,material,plan.objects.length);
   m.userData.acceptedIslandAssets=plan.objects.length;m.userData.biome='island';
   for(let i=0;i<plan.objects.length;i++){
    const p=plan.objects[i];rot.set(0,p.heading,0);q.setFromEuler(rot);
    pos.set(p.x,p.y,p.z);size.setScalar(.85+(i%3)*.16);mat.compose(pos,q,size);m.setMatrixAt(i,mat);
   }
   m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere();scene.add(m);groups.set(key,m);
  }
 }
 let position={x:0,z:0};
 function windowPosition(){return position;}
 function step(p){position=p;update();}
 function dispose(){for(const m of groups.values())scene.remove(m);groups.clear();geometry.dispose();}
 return {update:step,dispose,get chunks(){return groups.size},density(x,z){const a=Math.floor(x/16),b=Math.floor(z/16);return planLivingLandChunk(a,b,seed,height,sea)}};
}
