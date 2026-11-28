// Original Overture horn construction, shared unchanged between both chapters.
export const HORN_COLOR=4870248;
export function createDragonHorn(THREE,side,material){
 const root=new THREE.Group();root.position.set(side*.8,.9,-.2);root.rotation.set(-.55,0,side*.3);
 const main=new THREE.Mesh(new THREE.BoxGeometry(.36,.36,2),material);main.position.set(0,0,-1);root.add(main);
 const tip=new THREE.Mesh(new THREE.BoxGeometry(.24,.24,1),material);tip.position.set(0,.25,-2.1);tip.rotation.x=.45;root.add(tip);
 return root;
}
// Estimate head socket from compact upper central occupied RGBA slices of each authored pose.
export function headSocket(THREE,im,m){
 const {nx,nz,ny,cols}=m,canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);
 const rgba=ctx.getImageData(0,0,im.width,im.height).data,center=(nx-1)/2;
 const rows=[];let peak=0;
 for(let y=Math.floor(ny*.58);y<Math.floor(ny*.92);y++){
  let count=0,sx=0,sz=0;
  for(let z=0;z<nz;z++)for(let x=Math.ceil(center-nx*.14);x<=Math.floor(center+nx*.14);x++){
   if(rgba[4*((Math.floor(y/cols)*nz+z)*im.width+(y%cols)*nx+x)+3]<=127)continue;
   count++;sx+=x+.5;sz+=z+.5;
  }
  rows.push({y,count,sx,sz});peak=Math.max(peak,count);
 }
 if(!peak)return null;
 let i=rows.length-1;while(i>0&&rows[i].count<Math.max(3,peak*.38))i--;
 const top=rows[i];if(!top.count)return null;
 let n=0,x=0,z=0;for(let k=Math.max(0,i-2);k<=i;k++){const row=rows[k];n+=row.count;x+=row.sx;z+=row.sz;}
 const s=3.3/ny;return new THREE.Vector3((x/n-nx/2)*s,(top.y+1)*s,(z/n-nz/2)*s);
}
export function attachDragonHorns(THREE,root,material,sockets){
 const pivot=new THREE.Group();pivot.name='z23-original-dragon-horns';pivot.scale.setScalar(.24);
 for(const side of [-1,1])pivot.add(createDragonHorn(THREE,side,material));root.add(pivot);
 function frame(i){const p=sockets[i];pivot.visible=!!p;if(p){pivot.position.copy(p);pivot.position.y-=.24*.75;}}
 frame(0);
 return {frame,get visible(){return pivot.visible;},dispose(){pivot.removeFromParent();pivot.traverse(o=>{if(o.isMesh)o.geometry.dispose();});material.dispose();}};
}
