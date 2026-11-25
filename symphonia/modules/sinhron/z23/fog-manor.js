// Original Adagio RGBA volume atlas and greedy stackGeo; no substitute art.
import * as THREE from 'three';
function stackGeo(a,im,k=1){const {nx,nz,ny:NY,s,cols}=a;const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);const rgba=ctx.getImageData(0,0,im.width,im.height).data;
  // k=1 — полная модель; k=2 — дальняя копия: берётся каждый второй слой двойной толщины (цвета и силуэт те же, видна только издалека, в тумане)
  const ny=Math.ceil(NY/k),sl=y=>Math.min(NY-1,y*k);
  const occ=new Uint8Array(nx*nz*ny);const idx=(x,z,y)=>(y*nz+z)*nx+x;
  for(let y=0;y<ny;y++)for(let z=0;z<nz;z++)for(let x=0;x<nx;x++)occ[idx(x,z,y)]=rgba[4*((Math.floor(sl(y)/cols)*nz+z)*im.width+(sl(y)%cols)*nx+x)+3]>127?1:0;
  const solid=(x,z,y)=>x>=0&&x<nx&&z>=0&&z<nz&&y>=0&&y<ny&&occ[idx(x,z,y)];const vs=[];const X=x=>(x-nx/2)*s,Z=z=>(z-nz/2)*s,Y=y=>Math.min(NY,y*k)*s;
  const uv=(x,z,y)=>{y=sl(y);return [(y%cols*nx+x)/im.width,(Math.floor(y/cols)*nz+z)/im.height];};function quad(p,u,n){for(const i of [0,1,2,0,2,3])vs.push(...p[i],...u[i],...n)}
  for(let y=0;y<ny;y++)for(const dy of [1,-1]){const done=new Uint8Array(nx*nz),ex=(x,z)=>solid(x,z,y)&&!solid(x,z,y+dy);const yy=Y(y+(dy>0?1:0));
    for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){if(done[z*nx+x]||!ex(x,z))continue;let w=1;while(x+w<nx&&!done[z*nx+x+w]&&ex(x+w,z))w++;let h=1;grow:while(z+h<nz){for(let k=0;k<w;k++)if(done[(z+h)*nx+x+k]||!ex(x+k,z+h))break grow;h++;}
      for(let j=0;j<h;j++)for(let k=0;k<w;k++)done[(z+j)*nx+x+k]=1;const e=x+w,f=z+h;
      quad([[X(x),yy,Z(z)],[X(e),yy,Z(z)],[X(e),yy,Z(f)],[X(x),yy,Z(f)]],[uv(x+.01,z+.01,y),uv(e-.01,z+.01,y),uv(e-.01,f-.01,y),uv(x+.01,f-.01,y)],[0,dy,0]);}}
  for(let y=0;y<ny;y++)for(let z=0;z<nz;z++)for(let face=2;face<4;face++){const dy=face===0?1:face===1?-1:0,dz=face===2?1:face===3?-1:0;for(let x=0;x<nx;){if(!solid(x,z,y)||solid(x,z+dz,y+dy)){x++;continue}const b=x++;while(x<nx&&solid(x,z,y)&&!solid(x,z+dz,y+dy))x++;const e=x;const u0=uv(b+.01,z+.5,y),u1=uv(e-.01,z+.5,y);if(dy){const yy=Y(y+(dy>0?1:0));quad([[X(b),yy,Z(z)],[X(e),yy,Z(z)],[X(e),yy,Z(z+1)],[X(b),yy,Z(z+1)]],[uv(b+.01,z+.01,y),uv(e-.01,z+.01,y),uv(e-.01,z+.99,y),uv(b+.01,z+.99,y)],[0,dy,0])}else{const zz=Z(z+(dz>0?1:0));quad([[X(b),Y(y),zz],[X(e),Y(y),zz],[X(e),Y(y+1),zz],[X(b),Y(y+1),zz]],[u0,u1,u1,u0],[0,0,dz])}}}
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)for(const dx of [-1,1])for(let z=0;z<nz;){if(!solid(x,z,y)||solid(x+dx,z,y)){z++;continue}const b=z++;while(z<nz&&solid(x,z,y)&&!solid(x+dx,z,y))z++;const e=z,xx=X(x+(dx>0?1:0)),u0=uv(x+.5,b+.01,y),u1=uv(x+.5,e-.01,y);quad([[xx,Y(y),Z(b)],[xx,Y(y),Z(e)],[xx,Y(y+1),Z(e)],[xx,Y(y+1),Z(b)]],[u0,u1,u1,u0],[dx,0,0])}
  const f=new Float32Array(vs),ib=new THREE.InterleavedBuffer(f,8),g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.InterleavedBufferAttribute(ib,3,0));g.setAttribute('uv',new THREE.InterleavedBufferAttribute(ib,2,3));g.setAttribute('normal',new THREE.InterleavedBufferAttribute(ib,3,5));
  g.computeBoundingSphere();return g;}

const dir=new URL('../../../game/a/',import.meta.url);
const image=url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=url.href;});
function texture(im){const t=new THREE.Texture(im);t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;}
export function createFogManor(scene,glowTex){
 const root=new THREE.Group();root.name='z23-fog-manor';root.visible=false;scene.add(root);
 const toward=new THREE.Vector3(),target=new THREE.Vector3(),heading=new THREE.Vector3(),anchor=new THREE.Vector3();let ready=false,placed=false,windowTex,windowMat,halo,lastFrame=-1;
 const meshes=[],textures=[];
 async function load(){
   const response=await fetch(new URL('ext/ext_meta.json',dir));if(!response.ok)throw Error('manor atlas metadata');const meta=await response.json();
   const names=['facade','wing','dome'];
   const images=await Promise.all(names.map(n=>image(new URL('ext/'+n+'.png',dir))).concat(image(new URL('pianistka.webp',dir))));
   const parts={};
   for(let i=0;i<names.length;i++){
     const n=names[i],tex=texture(images[i]);textures.push(tex);
     const geo=stackGeo(meta[n],images[i],2),mat=new THREE.MeshBasicMaterial({map:tex,color:0x526780,side:THREE.DoubleSide,fog:true,alphaTest:.5});
     parts[n]={geo,mat};meshes.push(parts[n]);
     await new Promise(resolve=>setTimeout(resolve,0));
   }
   const add=(n,x,y,z)=>{const m=new THREE.Mesh(parts[n].geo,parts[n].mat);m.position.set(x,y,z);root.add(m);};
   add('facade',0,1,0);add('wing',-9.05,0,.2);add('wing',9.05,0,.2);add('dome',0,12.2,-.4);
   windowTex=texture(images[3]);windowTex.flipY=true;windowTex.repeat.set(1/3,1/3);windowTex.needsUpdate=true;
   windowMat=new THREE.MeshBasicMaterial({map:windowTex,transparent:true,alphaTest:.04,depthWrite:false,side:THREE.DoubleSide,color:0xffe0b1,fog:false});
   const windowPlane=new THREE.Mesh(new THREE.PlaneGeometry(1.45*.8906,1.45),windowMat);windowPlane.position.set(0,8.025,3.35);root.add(windowPlane);
   halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffd090,transparent:true,opacity:.24,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));halo.position.set(0,8.1,3.5);halo.scale.set(3.2,3.2,1);root.add(halo);
   ready=true;
 }
 load().catch(()=>{root.visible=false;for(const p of meshes){p.geo.dispose();p.mat.dispose();}for(const t of textures)t.dispose();root.clear();});
 return {
 reset(){placed=false;root.visible=false;},
 tick(dt,time,depth,origin,camera,active){
   root.visible=ready&&active;if(!root.visible)return;
   camera.getWorldDirection(toward);toward.y=0;if(toward.lengthSq()<.001)toward.set(0,0,-1);toward.normalize();
   if(!placed)heading.copy(toward);else heading.lerp(toward,1-Math.exp(-.9*dt)).normalize();
   const tier=Math.max(1,Math.min(6,depth||1)),distance=44-(tier-1)*4;
   target.copy(origin).addScaledVector(heading,distance);target.y=origin.y-14+(tier-1)*1.5;
   if(!placed){anchor.copy(target);placed=true;}else anchor.lerp(target,1-Math.exp(-1.1*dt));
   root.position.copy(anchor);root.rotation.y=Math.atan2(-heading.x,-heading.z);root.scale.setScalar(1.15);
   const f=Math.floor(time*7.14)%9;if(f!==lastFrame){windowTex.offset.set((f%3)/3,(2-Math.floor(f/3))/3);lastFrame=f;}
   windowMat.opacity=Math.min(.9,.28+tier*.11);halo.material.opacity=(.13+tier*.045)*(.94+.06*Math.sin(time*1.7));
 }
 };
}
