// Original 3D Sunken City guest. Geometry, rig, textures and swim animation are
// loaded untouched from the owner's original models/angler.glb; no custom mesh.
import {guestSourceFor} from './guest-roster.mjs';
export function createSunkenOriginalGuest({THREE,scene,onLoad=()=>{}}){
 const ref=guestSourceFor('sunken'),group=new THREE.Group();
 group.name='sunken-original-angler';
 let mixer=null,loaded=false,failed=false,root=null,clonedMaterials=[];
 const ready=import('three/addons/loaders/GLTFLoader.js').then(({GLTFLoader})=>new Promise(resolve=>{
  const loader=new GLTFLoader();
  function success(gltf){
   try{
    root=gltf.scene;
    const box=new THREE.Box3().setFromObject(root),size=new THREE.Vector3();
    box.getSize(size);
    if(size.lengthSq()<=0)throw Error('Original source GLB has no drawable geometry');
    root.scale.multiplyScalar(1.65/Math.max(size.x,size.y,size.z,.01));
    root.traverse(part=>{
     if(!part.isMesh)return;
     if(part.material){
      if(Array.isArray(part.material))part.material=part.material.map(m=>m.clone());
      else part.material=part.material.clone();
      for(const mat of Array.isArray(part.material)?part.material:[part.material]){
       if(mat.emissive){mat.userData.originalEmissive=mat.emissive.clone();mat.emissive=new THREE.Color(0x530d20);}
       clonedMaterials.push(mat);
      }
     }
    });
    group.add(root);
    if(gltf.animations.length){mixer=new THREE.AnimationMixer(root);mixer.clipAction(gltf.animations[0]).play()}
    loaded=true;onLoad(group);resolve(true);
   }catch{failed=true;resolve(false)}
  }
  function failure(){failed=true;resolve(false)}
  const embedded=globalThis.__threeWorldsModels?.[ref.sourceModel];
  if(!embedded){failure();return}
  try{
   const bytes=Uint8Array.from(atob(embedded),c=>c.charCodeAt(0));
   loader.parse(bytes.buffer,'',success,failure);
  }catch{failure()}
 }));
 function update(dt,clock){
  mixer?.update(dt);
  for(const mat of clonedMaterials)if(mat.emissive){
   mat.emissiveIntensity=.35+.3*(.5+.5*Math.sin(clock*7));
  }
 }
 function dispose(){
  mixer?.stopAllAction();scene.remove(group);
  for(const mat of clonedMaterials)mat.dispose();
 }
 return {root:group,ref,ready,update,dispose,get loaded(){return loaded},get failed(){return failed},get mesh(){return root}};
}
