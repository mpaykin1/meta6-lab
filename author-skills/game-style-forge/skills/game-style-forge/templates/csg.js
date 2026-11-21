/**
 * Game Style Forge — three-bvh-csg@0.0.18 procedural ruined gateway.
 * A single, real CSG-subtracted, watertight arch is authored once.
 * The resulting STATIC mesh is registered with three-mesh-bvh for visual raycasts;
 * explicitly authored box colliders go to Rapier. Never give CSG control of hero physics.
 * Other glTF models remain immutable: no implicit cutouts on imported assets.
 */
import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';

function inputBrush(geometry, transform={}) {
  const brush = new Brush(geometry);
  if(transform.position) brush.position.set(...transform.position);
  if(transform.rotation) brush.rotation.set(...transform.rotation);
  brush.updateMatrixWorld(true);
  return brush;
}

/**
 * Explicit tool for authored static meshes only. Returns a NEW mesh rather than
 * changing the original. Two-manifold geometries are required. No skins/morphs.
 */
export function subtractStaticBrushes(baseGeometry, cutters, material) {
  if(!baseGeometry?.getAttribute?.('position')) throw new Error('CSG base geometry is required');
  if(!Array.isArray(cutters) || !cutters.length || cutters.length>8) throw new Error('1–8 CSG cutters required');
  const evaluator = new Evaluator();
  evaluator.useGroups = false;
  evaluator.consolidateGroups = true;
  let mesh = inputBrush(baseGeometry.clone());
  for (const entry of cutters) {
    const cutter = inputBrush(entry.geometry.clone(), entry);
    const cut = evaluator.evaluate(mesh, cutter, SUBTRACTION);
    if(!cut?.geometry?.getAttribute('position')?.count) throw new Error('CSG resulted in empty geometry');
    // The previous result is not kept in the scene or shared with source models.
    if(mesh.geometry && mesh.geometry!==baseGeometry) mesh.geometry.dispose();
    cutter.geometry.dispose();
    mesh = cut;
    mesh.updateMatrixWorld(true);
  }
  mesh.material = material;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  return mesh;
}

export function createRuinGateway({scene, spatial, physics, stoneColor='#6d7482', glowColor='#e9c999'}) {
  const root = new THREE.Group(); root.name = 'CSG_Gateway_RealCarvedGeometry';
  const warm = new THREE.Color(glowColor);
  const stone = new THREE.MeshStandardMaterial({color:new THREE.Color(stoneColor).multiplyScalar(.68),roughness:.96,metalness:.03,side:THREE.DoubleSide});
  // Relative to wall center (0,3.2,-14); opening clear down to ground.
  const cutters = [
    {geometry:new THREE.BoxGeometry(3.5,4.3,3.0),position:[0,-1.05,0]},
    {geometry:new THREE.CylinderGeometry(1.75,1.75,3.0,36,1,false),position:[0,1.10,0],rotation:[Math.PI/2,0,0]},
    {geometry:new THREE.CylinderGeometry(.66,.66,3.0,24,1,false),position:[-3.16,.99,0],rotation:[Math.PI/2,0,0]},
    {geometry:new THREE.CylinderGeometry(.66,.66,3.0,24,1,false),position:[3.16,.99,0],rotation:[Math.PI/2,0,0]},
  ];
  const wall = subtractStaticBrushes(new THREE.BoxGeometry(9.7,6.4,1.85),cutters,stone);
  wall.position.set(0,3.2,-14);wall.updateWorldMatrix(true,false);
  wall.name = 'True CSG stone arch (open passage, two cut windows)';
  root.add(wall);
  scene.add(root);
  spatial?.registerStatic(wall);
  // Author-placed proxies match structural solids but NEVER seal the doorway.
  // Static boxes, not reconstructed from pixels or BVH meshes.
  if(physics?.registerStaticBox){
    for(const [x,y,z,w,h,d] of [[-3.45,3.2,-14,2.8,6.4,1.85],[3.45,3.2,-14,2.8,6.4,1.85],[0,6.18,-14,4.1,.44,1.85]]){
      physics.registerStaticBox({x,y,z},[w,h,d]);
    }
  }
  const glowMaterial=new THREE.MeshBasicMaterial({color:warm,transparent:true,opacity:.65,depthWrite:false});
  const arc = new THREE.Mesh(new THREE.TorusGeometry(1.78,.023,5,64,Math.PI),glowMaterial);
  arc.position.set(0,4.30,-12.96);root.add(arc);
  const rods=[];
  for(const x of [-1.78,1.78]){
    const rod=new THREE.Mesh(new THREE.CylinderGeometry(.023,.023,4.15,6),glowMaterial.clone());
    rod.position.set(x,2.1,-12.96);root.add(rod);rods.push(rod);
  }
  const light=new THREE.PointLight(warm,2.4,13,2);light.position.set(0,4.4,-12.4);root.add(light);
  const sparks=[];
  const sparMat=new THREE.MeshBasicMaterial({color:warm,transparent:true,opacity:.85,depthWrite:false});
  for(let i=0;i<16;i++){
    const p=new THREE.Mesh(new THREE.TetrahedronGeometry(.035+(i%4)*.008),sparMat.clone());
    p.userData.phase=i*2.399963;
    root.add(p);sparks.push(p);
  }
  function update(t){
    // Living-world motion is independent of player input and physics.
    light.intensity=1.9+.50*Math.sin(t*1.6);
    arc.material.opacity=.44+.16*Math.sin(t*1.4);
    for(let i=0;i<rods.length;i++) rods[i].material.opacity=.35+.2*Math.sin(t*1.2+i*.7);
    for(let i=0;i<sparks.length;i++){
      const p=sparks[i], phase=p.userData.phase, a=t*.19+phase;
      p.position.set(Math.cos(a)*(.9+(i%4)*.16),1.8+(i%7)*.32+.16*Math.sin(t*.6+phase),-12.78+.2*Math.sin(a));
      p.rotation.y=t*.55+phase;
      p.material.opacity=.2+.5*(.5+.5*Math.sin(t*.8+phase));
    }
  }
  function dispose(){root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.material!==stone)o.material.dispose();});scene.remove(root);stone.dispose();}
  return {wall,root,update,dispose};
}
