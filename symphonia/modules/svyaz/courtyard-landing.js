// Reuse original Adagio manor meshes/atlas and stone texture.
import * as THREE from 'three';
import {createMazeMist} from '../sinhron/z23/living-fog.js';
export function createCourtyardLanding(source){
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x303b50);scene.fog=new THREE.FogExp2(0x303b50,.025);
 const loader=new THREE.TextureLoader();let stone=null,loading=false,root=null,win=null,halo=null,lastFrame=-1,mist=null;
 function prepare(){
  if(loading||stone)return;loading=true;
  loader.load(new URL('../../game/a/ext/stone.jpg',import.meta.url).href,t=>{t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,8);stone=t;},undefined,()=>{loading=false;});
 }
 function begin(seed,losses){
  const original=source.getObjectByName('z23-fog-manor');if(!original||original.children.length<6||!stone)return false;
  if(!root){root=original.clone(true);root.visible=true;root.position.set(0,0,0);root.quaternion.identity();root.scale.setScalar(1);scene.add(root);
   const floor=new THREE.Mesh(new THREE.PlaneGeometry(70,70),new THREE.MeshBasicMaterial({map:stone,color:0x8b8b94}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-.04,20);scene.add(floor);
   win=root.children.find(o=>o.isMesh&&o.material?.map?.repeat.x<.4&&o.material?.map?.repeat.y<.4);halo=root.children.find(o=>o.isSprite);
   if(win)win.material=win.material.clone();if(halo)halo.material=halo.material.clone();
  }
  mist=createMazeMist(seed,losses);lastFrame=-1;return true;
 }
 function tick(camera,p,time,dt){
  const a=Math.min(1,Math.max(0,(p-.5)*2)),u=a*a*(3-2*a);
  camera.position.set(0,12-10.22*u,32-12*u);camera.lookAt(0,6.8-1.6*u,0);
  if(win){const f=Math.floor(time*7.14)%9;if(f!==lastFrame){win.material.map.offset.set((f%3)/3,(2-Math.floor(f/3))/3);lastFrame=f;}win.material.opacity=.96;}
  if(halo)halo.material.opacity=.4+.035*Math.sin(time*1.7);
  if(mist){const d=mist(0,camera.position.z,time,.025);scene.fog.density+=(d-scene.fog.density)*(1-Math.exp(-2*dt));}
 }
 prepare();
 return {scene,prepare,begin,tick,get ready(){return !!stone&&(source.getObjectByName('z23-fog-manor')?.children.length||0)>=6;}};
}
