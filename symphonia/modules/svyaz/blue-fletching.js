// Reuse the two actual fletching meshes from the existing arrow, not new art.
import {Group,Vector3,MeshBasicMaterial,Color} from 'three';
export function createBlueFletching(scene){
 const active=[],mat=new MeshBasicMaterial({color:new Color(.32,1.5,3.1),transparent:true});
 const limit=32;
 function remove(i){scene.remove(active[i].mesh);active.splice(i,1);}
 function reset(){while(active.length)remove(active.length-1);}
 function spawn(arrow){
  if(!arrow?.children?.[2]||!arrow.children[3])return;
  if(active.length>=limit)remove(0);
  const mesh=new Group();arrow.getWorldPosition(mesh.position);arrow.getWorldQuaternion(mesh.quaternion);
  for(const src of arrow.children.slice(2,4)){const p=src.clone();p.position.z+=.44;p.material=mat;mesh.add(p);}
  mesh.scale.setScalar(2.8);scene.add(mesh);
  active.push({mesh,age:0,v:new Vector3((Math.random()-.5)*2,1.6,(Math.random()-.5)*2),phase:Math.random()*6.28});
 }
 function tick(dt){if(dt<=0)return;for(let i=active.length-1;i>=0;i--){const p=active[i];p.age+=dt;p.v.y-=.7*dt;p.mesh.position.addScaledVector(p.v,dt);p.mesh.rotation.z+=Math.sin(p.age*3+p.phase)*dt*1.5;p.mesh.rotation.y+=dt*.8;p.mesh.scale.setScalar(2.8*Math.max(.01,1-Math.max(0,p.age-2.4)/1.2));if(p.age>=3.6)remove(i);}}
 return {reset,spawn,tick};
}
