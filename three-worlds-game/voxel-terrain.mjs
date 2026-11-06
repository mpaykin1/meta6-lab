// §21.11 — shared voxel-column mesher for Ash, Island extension and Sunken City.
// Accepted original Island uses its own voxel mesher; all other terrain now follows
// the same integer columns. The identical sample drives rendering and collisions.
// Greedy top rectangles + side runs; internal faces never exist.
export const CELL=1;
// Shared EAST-coast ocean chunk inclusion predicate; runtime and tests use the same boundary.
export const EAST_OCEAN_CLIP_X=64;
export const oceanEastChunkHasTerrain=(cx,size=24,clipX=EAST_OCEAN_CLIP_X)=>(cx+1)*size>clipX;
export const voxelHeight=(n)=>Number.isFinite(n)?Math.round(n):0;
export const voxelSample=(height,x,z)=>voxelHeight(height(Math.floor(x)+.5,Math.floor(z)+.5));
export function buildGreedyVoxelChunk(cx,cz,height,{size=16,sea=3.8,topTile,sideTile,clipX=-Infinity}={}){
 const px=cx*size,pz=cz*size,grid=new Int16Array(size*size);
 const h=(x,z)=>voxelSample(height,px+x,pz+z);
 for(let z=0;z<size;z++)for(let x=0;x<size;x++)grid[x+z*size]=h(x,z);
 const pos=[],normals=[],uv=[],colors=[],indices=[],aCut=[],E=.0006;
 const floor=(x,z)=>x>=0&&z>=0&&x<size&&z<size?grid[x+z*size]:h(x,z);
 const tileTop=topTile||((y)=>y>sea?0:4);
 const tileSide=sideTile||((y)=>y>sea?8:4);
 let quads=0;
 function face(v,n,tile,shade){
  const vi=pos.length/3,tx=tile%4,ty=Math.floor(tile/4);
  const u0=tx/4+E,u1=(tx+1)/4-E,v0=1-(ty+1)/3+E,v1=1-ty/3-E;
  const coords=[[u0,v1],[u0,v0],[u1,v0],[u1,v1]];
  for(let i=0;i<4;i++){pos.push(...v[i]);normals.push(...n);uv.push(...coords[i]);
   colors.push(shade,shade,shade);aCut.push(0);}
  indices.push(vi,vi+1,vi+2,vi,vi+2,vi+3);quads++;
 }
 // 2D greedy top rectangles, grouped only when voxel height and atlas tile match.
 const used=new Uint8Array(size*size);
 // The 48..72 ocean chunk overlaps the owner's 48..64 Island core. Never draw its cells.
 for(let z=0;z<size;z++)for(let x=0;x<size;x++)if(px+x<clipX)used[x+size*z]=1;
 for(let z=0;z<size;z++)for(let x=0;x<size;x++){
  const k=x+size*z;if(used[k])continue;
  const y=grid[k],tile=tileTop(y),match=(i,j)=>!used[i+size*j]&&grid[i+size*j]===y&&tileTop(y)===tile;
  let w=1;while(x+w<size&&match(x+w,z))w++;
  let d=1;outer:while(z+d<size){for(let i=0;i<w;i++)if(!match(x+i,z+d))break outer;d++}
  for(let zz=z;zz<z+d;zz++)for(let xx=x;xx<x+w;xx++)used[xx+size*zz]=1;
  const X=px+x,Z=pz+z;
  face([[X,y,Z],[X,y,Z+d],[X+w,y,Z+d],[X+w,y,Z]],[0,1,0],tile,y>sea?.93:.75);
 }
 // Greedy side strips: extend as long as vertical interval and tile agree.
 for(const dir of [{dx:1,dz:0},{dx:-1,dz:0},{dx:0,dz:1},{dx:0,dz:-1}]){
  const alongX=!!dir.dz;
  for(let line=0;line<size;line++){
   let offset=0;
   while(offset<size){
    const x=alongX?offset:line,z=alongX?line:offset;
    if(px+x<clipX){offset++;continue}
    const top=floor(x,z),bottom=floor(x+dir.dx,z+dir.dz);
    if(top<=bottom){offset++;continue}
    const tile=tileSide(top);let len=1;
    while(offset+len<size){
     const xx=alongX?offset+len:line,zz=alongX?line:offset+len;
     if(px+xx<clipX)break;
     if(floor(xx,zz)!==top||floor(xx+dir.dx,zz+dir.dz)!==bottom||tileSide(top)!==tile)break;len++;
    }
    const X=px+x,Z=pz+z,hi=top,lo=bottom;
    let v;
    if(dir.dx===1)v=[[X+1,lo,Z],[X+1,hi,Z],[X+1,hi,Z+len],[X+1,lo,Z+len]];
    else if(dir.dx===-1)v=[[X,lo,Z+len],[X,hi,Z+len],[X,hi,Z],[X,lo,Z]];
    else if(dir.dz===1)v=[[X+len,lo,Z+1],[X+len,hi,Z+1],[X,hi,Z+1],[X,lo,Z+1]];
    else v=[[X,lo,Z],[X,hi,Z],[X+len,hi,Z],[X+len,lo,Z]];
    face(v,[dir.dx,0,dir.dz],tile,top>sea?.77:.58);offset+=len;
   }
  }
 }
 return {pos,normals,uv,colors,indices,aCut,quads,minHeight:Math.min(...grid),maxHeight:Math.max(...grid),heights:[...grid]};
}
