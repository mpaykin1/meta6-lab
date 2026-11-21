/** Recast 0.44.0/Detour pathfinding over actual Rapier static walkable geometry.
 * Never includes imported model scenery or dynamic crates as navigation surfaces.
 * Dynamic obstacles are resolved by Rapier's NPC character controller; the
 * route is regenerated if collision prevents progress. No auto hero commands.
 */
import * as THREE from 'three';
import {init, NavMeshQuery} from 'recast-navigation';
import {threeToSoloNavMesh, NavMeshHelper} from '@recast-navigation/three';
const RATE=1/60;
const finitePoint = p => p && ['x','y','z'].every(k=>Number.isFinite(p[k]));

function walkableFromPhysics(physics) {
  // Collider top: -0.34 + 0.32 = -0.02; same XZ world coordinates for Rapier and Three.
  const y=-0.016, cell=0.8;
  const minX=-5.16,maxX=5.16,minZ=-102,maxZ=7.6;
  const verts=[], indexes=[];
  for(let x=minX; x+cell<=maxX+1e-6;x+=cell){
    for(let z=minZ;z+cell<=maxZ+1e-6;z+=cell){
      const cx=x+cell/2,cz=z+cell/2;
      if(physics.navFixedObstacles.some(o=>Math.abs(cx-o.x)<o.hx+0.38+cell/2 && Math.abs(cz-o.z)<o.hz+0.38+cell/2))continue;
      const k=verts.length/3;
      verts.push(x,y,z,x,y,z+cell,x+cell,y,z,x+cell,y,z+cell);
      // +Y normals (CCW from above), required by Recast.
      indexes.push(k,k+1,k+2,k+1,k+3,k+2);
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geo.setIndex(indexes);
  geo.computeVertexNormals();
  const walkable=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));
  walkable.name='static-walkable-rapier';
  walkable.updateMatrixWorld(true);
  return walkable;
}
function makeScout(scene){
  const root=new THREE.Group(); root.name='Recast Scout';scene.add(root);
  const coal=new THREE.MeshStandardMaterial({color:'#253f4c',roughness:0.8});
  const amber=new THREE.MeshStandardMaterial({color:'#f3c795',emissive:'#f39c65',emissiveIntensity:2.5});
  const mantle=new THREE.Mesh(new THREE.ConeGeometry(.35,1.04,7),coal);
  mantle.position.y=0.15;root.add(mantle);
  const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.23,1),coal);crown.position.y=.78;root.add(crown);
  const lantern=new THREE.Mesh(new THREE.OctahedronGeometry(.13,0),amber);lantern.position.set(.31,.45,-.19);root.add(lantern);
  const aura=new THREE.PointLight('#ffb27c',3.5,6);aura.position.set(.31,.45,-.19);root.add(aura);
  return {root,lantern,mantle,aura};
}
export class FusionNavigation {
  static async create({physics,scene}){
    await init();
    const floor=walkableFromPhysics(physics);
    let result;
    try{
      result=threeToSoloNavMesh([floor],{
        cs:0.18,ch:0.14,walkableRadius:Math.ceil(0.28/0.18),
        walkableSlopeAngle:45,walkableClimb:3,walkableHeight:12,
        minRegionArea:8,mergeRegionArea:20
      });
    }finally{floor.geometry.dispose();floor.material.dispose();}
    if(!result?.success||!result.navMesh)throw new Error('Recast не создал проходимый NavMesh');
    return new FusionNavigation(result.navMesh,physics,scene);
  }
  constructor(navMesh,physics,scene){
    this.navMesh=navMesh;this.query=new NavMeshQuery(navMesh);
    this.physics=physics;this.scene=scene;
    this.helper=new NavMeshHelper(navMesh,{navMeshMaterial:new THREE.MeshBasicMaterial({color:'#6fcbb0',wireframe:true,transparent:true,opacity:.26,depthWrite:false})});
    this.helper.visible=false;scene.add(this.helper);
    this.scout=makeScout(scene);
    physics.createGuideAgent();this.sync();
    this.targetID='';this.target=null;this.path=[];this.index=0;this.stuck=0;this.lastSpot=null;
    this.route=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:'#f5c18f',transparent:true,opacity:.46,depthWrite:false}));
    this.route.visible=false;scene.add(this.route);
    this.status='Готов';
    this.visibilityProbe=null;this.targetVisible=null;this._probeTick=0;
  }
  setVisibilityProbe(probe){this.visibilityProbe=typeof probe==='function'?probe:null;this.targetVisible=null;}
  sync(){const p=this.physics.guidePosition;if(p)this.scout.root.position.set(p.x,p.y-.78,p.z);}
  closest(pos){
    const r=this.query.findClosestPoint({x:pos.x,y:-.016,z:pos.z});
    if(!r.success||!finitePoint(r.point))return null;
    const deviation=Math.hypot(r.point.x-pos.x,r.point.z-pos.z);
    return deviation<3.5?r.point:null;
  }
  setTarget(id,pos){
    this.targetID=id;this.target=finitePoint(pos)?{x:pos.x,y:-.016,z:pos.z}:null;
    this.stuck=0;this.lastSpot=null;
    return this.plan();
  }
  plan(){
    this.path=[];this.index=0;this.route.visible=false;
    if(!this.target)return false;
    const start=this.closest(this.physics.guidePosition);
    const end=this.closest(this.target);
    if(!start||!end){this.status='Цель вне NavMesh';return false;}
    const res=this.query.computePath(start,end);
    if(!res.success||!Array.isArray(res.path)||res.path.length<1){this.status='Маршрут недоступен';return false;}
    if(res.path.length>1024){this.status='Слишком длинный маршрут';return false;}
    this.path=res.path.filter(finitePoint).map(p=>({x:p.x,y:p.y,z:p.z}));
    if(this.path.length===0){this.status='Путь пуст';return false;}
    const geo=new THREE.BufferGeometry().setFromPoints(this.path.map(p=>new THREE.Vector3(p.x,p.y+.12,p.z)));
    this.route.geometry.dispose();this.route.geometry=geo;this.route.visible=true;
    this.status='Маршрут проложен';return true;
  }
  command(){
    if(!this.target||!this.path.length)return {x:0,z:0};
    const p=this.physics.guidePosition;
    if(!p)return {x:0,z:0};
    while(this.index<this.path.length){
      const w=this.path[this.index];const d=Math.hypot(w.x-p.x,w.z-p.z);
      if(d>.35){const v=Math.max(d,0.001);return {x:(w.x-p.x)/v,z:(w.z-p.z)/v};}
      this.index++;
    }
    this.status='Проводник у цели';this.route.visible=false;
    return {x:0,z:0};
  }
  afterStep(paused=false){
    this.sync();
    if(!paused && this.target && this.visibilityProbe && ++this._probeTick%45===0){
      const p=this.physics.guidePosition;
      if(p)this.targetVisible=this.visibilityProbe({x:p.x,y:p.y+0.7,z:p.z},
        {x:this.target.x,y:this.target.y+1.5,z:this.target.z});
    }
    if(paused||!this.path.length||this.index>=this.path.length)return;
    const p=this.physics.guidePosition;
    if(!this.lastSpot){this.lastSpot={x:p.x,z:p.z};return;}
    this.stuck+=RATE;
    if(this.stuck>1.8){
      const moved=Math.hypot(p.x-this.lastSpot.x,p.z-this.lastSpot.z);
      if(moved<.24 && !this.plan())this.status='Путь заблокирован';
      this.lastSpot={x:p.x,z:p.z};this.stuck=0;
    }
  }
  animate(time,paused=false){
    const float=Math.sin(time*2.2);
    this.scout.lantern.scale.setScalar(1+.10*float);
    this.scout.aura.intensity=3.1+.6*(.5+.5*float);
    this.scout.mantle.rotation.z=paused?0:.035*Math.sin(time*5.4);
  }
  toggleDebug(){this.helper.visible=!this.helper.visible;return this.helper.visible;}
  destroy(){
    this.scene.remove(this.route,this.helper,this.scout.root);
    this.route.geometry.dispose();this.route.material.dispose();
    this.helper.geometry?.dispose?.();this.helper.material?.dispose?.();
    this.query.destroy();this.navMesh.destroy();
  }
}
