/**
 * Game Style Forge navigation adapter — recast-navigation-js@0.44.0.
 * A navmesh is built ONCE from authored walkable meshes and a real CSG arch.
 * Rapier remains the collision authority. Recast is ONLY NPC route planning.
 * No inference of walkability from MiDaS depth/video or hero graphics.
 */
import * as THREE from 'three';
import { createGridNavigator } from './navigation-grid.js';

const NAV_CONFIG={cs:0.25,ch:0.16,walkableHeight:2.0,walkableRadius:0.42,
                  walkableClimb:0.38,walkableSlopeAngle:46,maxEdgeLen:12,
                  minRegionArea:3,mergeRegionArea:12};
const STARTS=[[-.5,-5.5],[2.9,-20],[-3,-24],[4.3,-6.4]];
const TARGETS=[[.45,-24],[.15,-4.5],[.1,-5.5],[-.6,-22.5]];
const v3=(p)=>new THREE.Vector3(p.x, p.y||0, p.z);

async function makePathPlanner(obstacles,solidMeshes,gateway,authoredModels,importedAssets) {
  const modelBoxes=[];
  for(const model of authoredModels||[]){
    if(!model.collider)continue;
    const c=model.collider, p=model.position||[0,0,0],scale=Number(model.scale)||1;
    const b={x:Number(p[0]),z:Number(p[2]),width:Number(c.width)*scale,depth:Number(c.depth)*scale};
    if([b.x,b.z,b.width,b.depth].every(Number.isFinite))modelBoxes.push(b);
  }
  const fallback=createGridNavigator(obstacles,{agentRadius:.38,modelBoxes});
  try {
    const [{init,NavMeshQuery},{threeToSoloNavMesh}]=await Promise.all([
      import('recast-navigation'), import('@recast-navigation/three')
    ]);
    await init();
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(38,46),new THREE.MeshBasicMaterial());
    floor.rotation.x=-Math.PI/2;
    floor.position.set(0,0,-10);
    floor.updateMatrixWorld(true);
    const collidable=solidMeshes.filter(mesh=>mesh?.isMesh && !mesh.isSkinnedMesh &&
      Math.abs(mesh.position.x)<18 && mesh.position.z>-32 && mesh.position.z<13 &&
      mesh.geometry?.getAttribute('position')?.count<12000);
    if(gateway?.wall)collidable.push(gateway.wall);
    // GLB source geometry is used only for props with explicit authored colliders.
    // Never label arbitrary imported/depth geometry as safe navigation surfaces.
    const authoredNames=new Set((authoredModels||[]).filter(x=>x.collider).map(x=>x.name));
    for(const asset of importedAssets?.objects||[]){
      if(!authoredNames.has(asset.userData?.gameStyleForgeName))continue;
      asset.traverse(obj=>{
        if(obj.isMesh&&!obj.isSkinnedMesh&&!obj.morphTargetInfluences?.length &&
           obj.geometry?.getAttribute('position')?.count<12000)collidable.push(obj);
      });
    }
    const generated=threeToSoloNavMesh([floor,...collidable],NAV_CONFIG);
    floor.geometry.dispose();floor.material.dispose();
    if(!generated.success||!generated.navMesh)throw Error(generated.error||'navmesh generation failed');
    const query=new NavMeshQuery(generated.navMesh);
    function path(from,to){
      try {
        const a=query.findClosestPoint(from),b=query.findClosestPoint(to);
        if(!a?.success||!b?.success)return fallback.path(from,to);
        const result=query.computePath(a.point,b.point);
        if(!result?.success || !Array.isArray(result.path) || result.path.length<2)
          return fallback.path(from,to);
        return result.path.map(p=>({x:p.x,y:p.y,z:p.z}));
      }catch(e){return fallback.path(from,to);}
    }
    return {mode:'recast-0.44.0',path,dispose:()=>{query.destroy?.();generated.navMesh.destroy?.();}};
  }catch(error){
    console.warn('Recast WASM unavailable, authored-grid route planner active:',error);
    return fallback;
  }
}

function makeKeeper(scene,index,glow){
  // Original ambient NPC generated for demonstration, not a replacement for
  // user-approved hero artwork. Persistent actor identity across all animations.
  const root=new THREE.Group();root.name=`LanternKeeper_${index+1}`;
  const darkMat=new THREE.MeshStandardMaterial({color:0x2d3037,roughness:.96});
  const trimMat=new THREE.MeshStandardMaterial({color:glow.clone().lerp(new THREE.Color('#556173'),.37),roughness:.78});
  const lampMat=new THREE.MeshStandardMaterial({color:glow,emissive:glow,emissiveIntensity:2.8});
  const body=new THREE.Group();root.add(body);
  const mantle=new THREE.Mesh(new THREE.ConeGeometry(.34,.95,7),darkMat);mantle.position.y=.81;body.add(mantle);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.23,10,8),trimMat);head.position.y=1.45;body.add(head);
  const armL=new THREE.Group(),armR=new THREE.Group();
  armL.position.set(-.36,1.13,0);armR.position.set(.36,1.13,0);body.add(armL,armR);
  const armGeo=new THREE.CapsuleGeometry(.065,.35,2,5);
  const la=new THREE.Mesh(armGeo,trimMat),ra=new THREE.Mesh(armGeo,trimMat);
  la.position.y=-.24;ra.position.y=-.24;armL.add(la);armR.add(ra);
  const lamp=new THREE.Mesh(new THREE.OctahedronGeometry(.14),lampMat);lamp.position.set(.53,.59,.11);body.add(lamp);
  const corona=new THREE.PointLight(glow,.3,3,2);corona.position.copy(lamp.position);body.add(corona);
  root.userData.body=body;root.userData.head=head;root.userData.arms=[armL,armR];
  root.userData.light=corona;root.userData.phase=index*2.399;scene.add(root);
  return root;
}

export async function createLivingNavigation({scene,obstacles,staticMeshes,gateway,physics,glow,authoredModels,importedAssets}) {
  const navigator=await makePathPlanner(obstacles,staticMeshes,gateway,authoredModels,importedAssets);
  const npcs=STARTS.map((p,i)=>{
    const mesh=makeKeeper(scene,i,glow.clone().offsetHSL((i-1)*.027,0,0));
    mesh.position.set(p[0],0,p[1]);
    const proxy=physics?.registerNavNPC?.({x:p[0],y:0,z:p[1]});
    return {mesh,proxy,index:i,goal:0,route:[],current:0,pause:0,phase:i*2.399};
  });
  function getRoute(agent){
    const target=TARGETS[(agent.index+agent.goal)%TARGETS.length];
    const points=navigator.path(agent.mesh.position,{x:target[0],y:0,z:target[1]});
    if(points?.length>=2){agent.route=points.map(v3);agent.current=1;}
    else {agent.route=[];agent.current=0;agent.pause=1.2;}
    agent.goal=(agent.goal+1)%TARGETS.length;
  }
  npcs.forEach(getRoute);
  function update(dt,t){
    for(const agent of npcs){
      const {mesh,phase}=agent,rig=mesh.userData;
      let walking=false;
      if(agent.pause>0)agent.pause-=dt;
      else if(agent.current<agent.route.length){
        const waypoint=agent.route[agent.current];
        const d=waypoint.clone().sub(mesh.position);d.y=0;
        const dist=d.length(),step=(1.25+agent.index*.14)*dt;
        if(dist<.18){agent.current++;if(agent.current>=agent.route.length)agent.pause=1.1+agent.index*.3;}
        else {mesh.position.addScaledVector(d,Math.min(step,dist)/Math.max(dist,1e-6));
          const heading=Math.atan2(d.x,d.z);
          mesh.rotation.y+=Math.atan2(Math.sin(heading-mesh.rotation.y),Math.cos(heading-mesh.rotation.y))*Math.min(1,dt*6);
          walking=true;}
      } else if(agent.pause<=0)getRoute(agent);
      const gait=walking?1:0;
      rig.body.position.y=.034*Math.sin(t*2+phase)+(walking?.055*Math.sin(t*10+phase):0);
      rig.body.rotation.z=.025*Math.sin(t*1.1+phase);
      rig.head.rotation.y=.15*Math.sin(t*.87+phase);
      rig.arms[0].rotation.x=.16*Math.sin(t*1.13+phase)+gait*.27*Math.sin(t*9+phase);
      rig.arms[1].rotation.x=.16*Math.sin(t*1.05+phase+2)-gait*.27*Math.sin(t*9+phase);
      rig.light.intensity=.26+.19*(.5+.5*Math.sin(t*1.73+phase));
      agent.proxy?.setTarget(mesh.position);
    }
  }
  function dispose(){navigator.dispose?.();for(const a of npcs){a.proxy?.dispose?.();a.mesh.traverse(obj=>{obj.geometry?.dispose?.();if(obj.material?.isMaterial)obj.material.dispose();});scene.remove(a.mesh);}}
  return {mode:navigator.mode,update,dispose,npcCount:npcs.length};
}
