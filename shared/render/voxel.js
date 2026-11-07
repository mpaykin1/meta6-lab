/* Shared voxel mesher: visible faces + greedy rectangles, including chunk borders.
   Caller supplies get(x,y,z) -> integer material (0=air), including neighbors.
   Output is typed position, normal, uv and material attributes. */
(function(root){
'use strict';
function meshVoxelSection(get,{size=16,origin=[0,0,0],opaque=id=>id!==0}={}){
 if(typeof get!=='function'||!Number.isInteger(size)||size<1||size>128)throw Error('Invalid voxel section');
 const positions=[],normals=[],uvs=[],materials=[],indices=[],dims=[size,size,size],x=[0,0,0],q=[0,0,0];
 let quads=0;
 const sample=(a,b,c)=>get(origin[0]+a,origin[1]+b,origin[2]+c)|0;
 for(let d=0;d<3;d++){
  const u=(d+1)%3,v=(d+2)%3; q.fill(0);q[d]=1;
  const mask=new Array(dims[u]*dims[v]);
  for(x[d]=-1;x[d]<dims[d];){
   let n=0;
   for(x[v]=0;x[v]<dims[v];x[v]++)for(x[u]=0;x[u]<dims[u];x[u]++){
    const a=sample(...x),b=sample(x[0]+q[0],x[1]+q[1],x[2]+q[2]);
    const insideA=x[d]>=0,insideB=x[d]+1<dims[d];
    // Material boundary is visible only against non-opaque neighbor.
    let m=0;
    if(insideA&&a&&(!b||!opaque(b)))m=a;
    else if(insideB&&b&&(!a||!opaque(a)))m=-b;
    mask[n++]=m;
   }
   x[d]++;
   n=0;
   for(let j=0;j<dims[v];j++)for(let i=0;i<dims[u];){
    const c=mask[n];if(!c){i++;n++;continue}
    let w=1;while(i+w<dims[u]&&mask[n+w]===c)w++;
    let h=1;outer:while(j+h<dims[v]){
      for(let k=0;k<w;k++)if(mask[n+k+h*dims[u]]!==c)break outer;
      h++;
    }
    x[u]=i;x[v]=j;
    const du=[0,0,0],dv=[0,0,0];du[u]=w;dv[v]=h;
    const base=positions.length/3,at=(a,b)=>[origin[0]+x[0]+a*du[0]+b*dv[0],origin[1]+x[1]+a*du[1]+b*dv[1],origin[2]+x[2]+a*du[2]+b*dv[2]];
    const corners=[at(0,0),at(1,0),at(1,1),at(0,1)];
    for(let k=0;k<4;k++){
      positions.push(...corners[k]);
      const normal=[0,0,0];normal[d]=Math.sign(c);normals.push(...normal);
      uvs.push(k===1||k===2?w:0,k>=2?h:0);
      materials.push(Math.abs(c));
    }
    // Orientation depends on cyclic axis order and face direction.
    if(c>0)indices.push(base,base+1,base+2,base,base+2,base+3);
    else indices.push(base,base+2,base+1,base,base+3,base+2);
    quads++;
    for(let y=0;y<h;y++)for(let k=0;k<w;k++)mask[n+k+y*dims[u]]=0;
    i+=w;n+=w;
   }
  }
 }
 return {positions:new Float32Array(positions),normals:new Int8Array(normals),uvs:new Float32Array(uvs),materials:new Uint16Array(materials),indices:new Uint32Array(indices),quads};
}
function packLocalPositions(positions,origin=[0,0,0],extent=[16,16,16]){
 const out=new Uint16Array(positions.length),scale=extent.map(v=>v/65535);
 for(let i=0;i<positions.length;i++){
  const axis=i%3;out[i]=Math.round(Math.max(0,Math.min(65535,(positions[i]-origin[axis])/scale[axis])));
 }
 return {data:out,origin:new Float32Array(origin),scale:new Float32Array(scale)};
}
function createLightLookup(sky=1,torch=[1,.68,.35]){
 const data=new Uint8Array(16*16*4);
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){
  const s=Math.max(0,Math.min(1,sky))*y/15, b=x/15,idx=(y*16+x)*4;
  for(let c=0;c<3;c++)data[idx+c]=Math.round(Math.min(1,Math.max(.025,s*.75+b*torch[c]*.85))*255);
  data[idx+3]=255;
 }
 return {width:16,height:16,data};
}
root.MetaVoxel=Object.freeze({meshVoxelSection,packLocalPositions,createLightLookup,version:'1.0.0'});
})(typeof window!=='undefined'?window:globalThis);
