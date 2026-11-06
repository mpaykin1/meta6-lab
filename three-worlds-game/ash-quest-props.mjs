// §21.25: story props are instances of OWNER'S ORIGINAL shipped art, not
// generated replacements. water_tower is an existing ash-assets definition;
// weather_storm_crystal is the original GRAF GLB already in models/MANIFEST.json.
import {createAshFactory} from './ash-assets.mjs';

export const ASH_QUEST_PROPS=Object.freeze([
 Object.freeze({id:'rusty_tower',label:'ржавая вышка',source:'ash-assets.mjs',model:'water_tower',x:-96,z:40}),
 Object.freeze({id:'blue_crystal',label:'голубой кристалл',source:'models/MANIFEST.json',model:'weather_storm_crystal',x:-92,z:40})
]);
export const questProp=id=>ASH_QUEST_PROPS.find(p=>p.id===id)||null;

export function createAshQuestProps({THREE,scene,height}){
 const factory=createAshFactory(THREE);
 const roots=new Map(),tickets=new Map();
 let disposed=false;
 const tower=questProp('rusty_tower'),definition=factory.models.find(x=>x.id===tower.model);
 if(!definition)throw Error('Approved original Ash tower asset absent');
 const towerInst=factory.instance(definition);
 towerInst.root.position.set(tower.x,height(tower.x,tower.z),tower.z);
 towerInst.root.scale.setScalar(.75);
 towerInst.root.name=tower.id;
 scene.add(towerInst.root);roots.set(tower.id,towerInst.root);

 const crystal=questProp('blue_crystal'),holder=new THREE.Group();
 holder.name=crystal.id;
 holder.position.set(crystal.x,height(crystal.x,crystal.z)+.8,crystal.z);
 scene.add(holder);roots.set(crystal.id,holder);
 const lamp=new THREE.PointLight(0x41a9ff,1.8,5);
 holder.add(lamp);
 const promise=import('three/addons/loaders/GLTFLoader.js').then(({GLTFLoader})=>new Promise(resolve=>{
  const loader=new GLTFLoader();
  function loaded(gltf){
   if(disposed){resolve(false);return}
   const m=gltf.scene;
   const bound=new THREE.Box3().setFromObject(m),size=new THREE.Vector3();
   bound.getSize(size);
   if(size.lengthSq()<.0001){resolve(false);return}
   m.scale.multiplyScalar(.8/Math.max(.01,size.x,size.y,size.z));
   m.position.y=.23;
   holder.add(m);
   tickets.set('blue_crystal',{source:'weather_storm_crystal.glb',object:m});
   resolve(true);
  }
  function fail(){resolve(false)}
  const embed=globalThis.__threeWorldsModels?.weather_storm_crystal;
  if(embed){
   try{
    const bytes=Uint8Array.from(atob(embed),c=>c.charCodeAt(0));
    loader.parse(bytes.buffer,'',loaded,fail);
   }catch{fail()}
  }else loader.load('./models/weather_storm_crystal.glb',loaded,undefined,fail);
 }));
 function update(time){
  holder.rotation.y=time*.45;
  holder.position.y=height(crystal.x,crystal.z)+.8+Math.sin(time*1.7)*.1;
  lamp.intensity=1.3+.65*Math.sin(time*2.5);
 }
 function dispose(){
  disposed=true;
  for(const obj of roots.values())scene.remove(obj);
  towerInst.mat.dispose();factory.dispose();lamp.dispose();
 }
 return {roots,ready:promise,update,dispose,sourceAssetReady:()=>tickets.has('blue_crystal'),
   has:id=>roots.has(id)&&((id!=='blue_crystal')||tickets.has(id))};
}
