import {clamp} from './world-core.mjs';
export function flightStep(player,dt,height,blocked=()=>false){
 const p=player.pos,v=player.vel,gy=height(p.x,p.z),target=player.jumpHeld?5.2:-1.7;
 v.y+=(target-v.y)*(1-Math.exp(-dt*3));
 const nx=p.x+v.x*dt,nz=p.z+v.z*dt;
 if(!blocked(nx,p.y,nz)){p.x=nx;p.z=nz}else{v.x=v.z=0}
 p.y=clamp(p.y+v.y*dt,height(p.x,p.z)+.35,120);player.onGround=p.y<=gy+.36;
 if(player.onGround)v.y=Math.max(0,v.y);return 0;
}
export function createAirRoutes({THREE,scene,player,height,prepare,travel,inShip,spawnInvasion,toast,getTargets=()=>[]}){
 const routes=[{x:-30,z:32,to:{x:-90,z:32}},{x:90,z:32,to:{x:38,z:32}},{x:-100,z:45,to:{x:100,z:34}}];
 const geometry=new THREE.TorusGeometry(2.2,.13,6,36),material=new THREE.MeshBasicMaterial({color:0x9c75ff,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false});
 const rings=routes.map(r=>{const m=new THREE.Mesh(geometry,material);m.position.set(r.x,Math.max(25,height(r.x,r.z)+18),r.z);scene.add(m);return m});
 const sonarGeo=new THREE.RingGeometry(.55,.68,24),sonarMat=new THREE.MeshBasicMaterial({color:0x79efff,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
 const sonar=new THREE.InstancedMesh(sonarGeo,sonarMat,16),dummy=new THREE.Object3D();sonar.frustumCulled=false;scene.add(sonar);
 let clock=0,last=-99,pulse=0,invade=140;
 function update(dt){clock+=dt;for(let i=0;i<rings.length;i++){const m=rings[i];m.rotation.y+=dt*.15;const r=routes[i];if(inShip()&&clock-last>8&&player.pos.distanceTo(m.position)<2.7){prepare(r.to.x,r.to.z);travel(r.to.x,r.to.z,Math.max(20,height(r.to.x,r.to.z)+14));last=clock;toast('Разлом пройден. Удерживай прыжок для набора высоты.',2400)}}
  // Sonar uses existing props, no screen panel: world-space ring pulse.
  pulse=(pulse+dt*.35)%1;material.opacity=.5+.25*Math.sin(clock*2);
  sonar.visible=inShip();let n=0;sonarMat.opacity=(1-pulse)*.65;
  if(sonar.visible)for(const p of getTargets()){if(n>=16)break;if(Math.hypot(p.x-player.pos.x,p.z-player.pos.z)>60)continue;dummy.position.set(p.x,Number.isFinite(p.y)?p.y:height(p.x,p.z)+.15,p.z);dummy.rotation.x=-Math.PI/2;dummy.scale.setScalar(1+pulse*3);dummy.updateMatrix();sonar.setMatrixAt(n++,dummy.matrix)}
  sonar.count=n;sonar.instanceMatrix.needsUpdate=true;
  invade-=dt;if(invade<=0){invade=180;spawnInvasion();toast('Разлом снова открыт. Гость просит помощи.',2600)}
 }
 function dispose(){for(const r of rings)scene.remove(r);geometry.dispose();material.dispose();scene.remove(sonar);sonarGeo.dispose();sonarMat.dispose()}
 return {update,dispose,routes};
}
