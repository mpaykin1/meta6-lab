// Original arrow fletching, shared chapter memory and one extra arrow per wave.
import {Nit} from './nit.js';
export function createAdagioLink(THREE){
 let prop=null,owned=false,available=false,used=false;
 const look=new THREE.Vector3(),delta=new THREE.Vector3(),base=new THREE.Vector3(1.45,1.12,4.9);
 function dispose(){
  if(!prop)return;
  prop.removeFromParent();
  const gs=new Set(),ms=new Set();prop.traverse(o=>{if(o.isMesh){gs.add(o.geometry);ms.add(o.material);}});
  gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());prop=null;
 }
 function mount(scene,arrowModel){
  dispose();owned=false;used=false;
  available=Nit.read().luchnik.perya>0;
  if(!available)return;
  const arrow=arrowModel();
  const art=arrow.children.slice(2,4);
  if(art.length!==2||art.some(o=>!o.isMesh)){available=false;return;}
  prop=new THREE.Group();prop.name='z23-blue-feathers';prop.position.copy(base);
  const mat=art[0].material.clone();mat.color.set(0x58baff);mat.toneMapped=false;
  for(let i=0;i<3;i++){
   const part=new THREE.Group();part.position.set((i-1)*.15,Math.abs(i-1)*.045,Math.abs(i-1)*.07);
   part.rotation.set(.35+i*.28,i*2.1,.6-i*.5);
   for(const src of art){const m=src.clone();m.material=mat;m.position.z-=.32;part.add(m);}
   part.scale.setScalar(2.3);prop.add(part);
  }
  for(const o of arrow.children){if(!art.includes(o))o.geometry?.dispose();o.material?.dispose();}
  scene.add(prop);
 }
 function tick(time,camera,player,active,onPickup){
  if(!prop||owned||!active)return;
  prop.position.y=base.y+.09*Math.sin(time*1.9);prop.rotation.y=time*.42;
  camera.getWorldDirection(look);
  delta.copy(prop.position).sub(camera.position);
  const distance=delta.length();
  if(distance>0&&distance<2.6&&player.distanceTo(base)<2.7&&look.dot(delta.normalize())>.76){
   owned=true;prop.visible=false;onPickup();
  }
 }
 function spread(wp,inWave){
  if(!owned||used||!inWave||wp.proj!=='arrow')return wp.sp;
  used=true;
  return [...wp.sp,Math.max(...wp.sp)+.035];
 }
 function nextWave(){used=false;}
 function death(){Nit.write('adagio',{smerti:Nit.read().adagio.smerti+1});}
 function circle(n){Nit.write('adagio',{krug:n});}
 function mirror(){Nit.write('adagio',{zerkalo:true});}
 return {mount,tick,spread,nextWave,death,circle,mirror,get available(){return available;},get owned(){return owned;}};
}
