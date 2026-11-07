/* META GAMES / WebGL2: loss-bounded compact layout for opaque mesh vertices.
 * 36 -> 20 bytes per (position, normal, RGB) vertex; position stays Float32.
 * Normal: normalized signed byte; RGB: normalized unsigned byte.
 * No external dependencies, no changes to physics vertices or draw ordering. */
(function(root){
'use strict';
const STRIDE=20;
function packInterleaved(input){
 if(!input||input.length%9!==0)throw new TypeError('Expected [px,py,pz,nx,ny,nz,r,g,b] vertices');
 const count=input.length/9;
 const data=new Uint8Array(count*STRIDE),view=new DataView(data.buffer);
 for(let i=0;i<count;i++){
  const p=i*9,b=i*STRIDE;
  for(let a=0;a<3;a++)view.setFloat32(b+a*4,input[p+a],true);
  for(let a=0;a<3;a++)view.setInt8(b+12+a,Math.round(Math.max(-1,Math.min(1,input[p+3+a]))*127));
  for(let a=0;a<3;a++)view.setUint8(b+15+a,Math.round(Math.max(0,Math.min(1,input[p+6+a]))*255));
 }
 return {data,count,stride:STRIDE,bytes:data.byteLength};
}
function setup(gl){
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,STRIDE,0);
 gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.BYTE,true,STRIDE,12);
 gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,3,gl.UNSIGNED_BYTE,true,STRIDE,15);
}
root.MetaPackedMesh=Object.freeze({packInterleaved,setup,stride:STRIDE,version:'1.0.0'});
})(typeof window!=='undefined'?window:globalThis);
