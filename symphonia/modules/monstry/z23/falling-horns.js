// Reuse the original dragon's own articulated horn meshes. No new geometry.
import {Vector3,Quaternion} from 'three';
export function createFallingHorns(scene,dragon){
 const live=dragon.z23Horns, falling=[];
 let dropped=false;
 const pos=new Vector3(),rot=new Quaternion(),scale=new Vector3();
 function reset(){for(const item of falling)scene.remove(item.mesh);falling.length=0;for(const h of live)h.visible=true;dropped=false;}
 function release(){
   if(dropped)return;dropped=true;dragon.root.updateMatrixWorld(true);
   for(let i=0;i<live.length;i++){
     const h=live[i];h.matrixWorld.decompose(pos,rot,scale);
     const mesh=h.clone(true);mesh.visible=true;mesh.position.copy(pos);mesh.quaternion.copy(rot);mesh.scale.copy(scale);scene.add(mesh);
     h.visible=false;
     falling.push({mesh,velocity:new Vector3((i?1:-1)*.9,1.2,.3),spin:new Vector3(.48,(i?1:-1)*.65,.24),age:0});
   }
 }
 function tick(dt){if(dt<=0)return;for(let i=falling.length-1;i>=0;i--){const f=falling[i];f.age+=dt;f.velocity.y-=3.4*dt;f.mesh.position.addScaledVector(f.velocity,dt);f.mesh.rotation.x+=f.spin.x*dt;f.mesh.rotation.y+=f.spin.y*dt;f.mesh.rotation.z+=f.spin.z*dt;if(f.age>4){scene.remove(f.mesh);falling.splice(i,1);}}}
 return {reset,release,tick};
}
