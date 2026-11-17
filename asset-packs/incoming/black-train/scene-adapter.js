// Standalone copy of the Night Scream game: source stays untouched.
// Only objects from the order are added; all existing enemy behaviour is preserved.
import '../../../reference/ink-night-scream/src/scene.js';
import {makers} from './makers.js';
import {createBlackTrainAudio} from './sounds.js';
const game=window.__INK_NIGHT_SCREAM__;
if(!game?.ready)throw new Error('BLACK TRAIN: reference game did not initialize');
const {scene,train}=game;
const assets={};
function put(name,seed,where,parent=scene){
 const a=makers[name](seed);if(where)a.position.set(...where);
 parent.add(a);assets[name]=a;return a;
}
const black=put('blackLocomotive',11,[0,0,0],train);
const crossing=put('crossingSign',7,[3.0,0,-9.7]);
const red=put('redSignalLamp',8,[4.25,0,-9.7]);
const chains=put('hangingChains',8,[3.15,0,-9.6]);
const treeChains=makers.hangingChains(88);treeChains.position.set(-6.1,0,-13.4);scene.add(treeChains);
const tree=put('gnarledTree',31,[-6.3,0,-13.2]);
const mist=put('groundMist',16,[1.3,0,-6.2]);
// Three asymmetrical specimens rather than a wall of repeated identical trees.
const fartherTrees=[makers.gnarledTree(73),makers.gnarledTree(129)];
fartherTrees[0].position.set(9.8,0,-19.0);
fartherTrees[1].position.set(-14.5,0,-25.0);
scene.add(...fartherTrees);
const storm=put('stormClouds',17,[0.5,5.3,-23.0]);
const fence=put('brokenFence',26,[8.4,0,-15.7]);
const grass=put('tallGrass',42,[1.1,0,-3.9]);
const wet=put('wetRailGlow',49,[3.3,0,-7.5]);
const wire=put('barbedWire',65,[7.5,0,-7.5]);wire.rotation.y=Math.PI/2;
const puddles=put('swampPuddles',83,[-1.9,0,-4.4]);
const puddlesNearLamp=makers.swampPuddles(93);puddlesNearLamp.position.set(4.5,0,-7.2);scene.add(puddlesNearLamp);
const grassFar=makers.tallGrass(105);grassFar.position.set(-2.4,0,-4.5);scene.add(grassFar);
const fenceFar=makers.brokenFence(103);fenceFar.position.set(-10,0,-18);scene.add(fenceFar);
const sound=createBlackTrainAudio();
const oldLoco=train.userData.rig.loco;
let lastActive=false,lastX=0,variant=false,last=performance.now();
const originalVisible=Object.fromEntries(Object.keys(assets).map(k=>[k,true]));
window.__ISOLATE__=(id,on)=>{
 if(!Object.hasOwn(assets,id))return false;
 originalVisible[id]=!!on;assets[id].visible=!!on;
 if(id==='blackLocomotive'&&on){variant=true;oldLoco.visible=false;}
 if(id==='hangingChains')treeChains.visible=!!on;
 return true;
};
window.__PACK__={items:Object.keys(assets).map(id=>({id,label:id}))};
window.__BLACK_TRAIN_ASSETS__={scene,assets,fartherTrees,order:15,created:15,
 show:id=>window.__ISOLATE__(id,true),hide:id=>window.__ISOLATE__(id,false)};
function frame(now){
 requestAnimationFrame(frame);
 if(document.hidden)return;
 const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
 const stat=game.stats().train;
 if(stat.active&&!lastActive){variant=!variant;}
 lastActive=stat.active;lastX=stat.x;
 // Alternate the original streamlined nose and the new massive upright BLACK TRAIN.
 // Carriages, original wheels, spotlight and monster remain exactly as in the game.
 oldLoco.visible=!variant;
 black.visible=variant&&originalVisible.blackLocomotive;
 if(!variant && originalVisible.blackLocomotive)black.visible=false;
 const approach=stat.active?Math.max(0,1-Math.abs(stat.x-3)/160):0;
 const blink=approach>0.02?(Math.sin(now*.001*(2+approach*5))>-.10?1:.06):.16;
 red.userData.tick(now*.001,dt);
 red.userData.light.intensity=(2+approach*23)*blink;
 red.userData.glass.material.color.setRGB(.34+approach*1.45,.02,.025);
 wet.userData.redMaterial.opacity=.06+.31*approach*blink;
 const t=now*.001;
 sound.tick(t,approach,game.stats().state!=='title');
 storm.userData.tick(t,dt);
 fence.userData.tick(t,dt);
 fenceFar.userData.tick(t+.4,dt);
 grass.userData.tick(t,dt);
 grassFar.userData.tick(t+.7,dt);
 wet.userData.tick(t,dt);
 wire.userData.tick(t,dt);
 puddles.userData.tick(t,dt);
 puddlesNearLamp.userData.tick(t+.38,dt);
 if(black.visible)black.userData.tick(t,dt);
 crossing.userData.tick?.(t,dt);
 chains.userData.tick(t,dt);
 treeChains.userData.tick(t+.65,dt);
 tree.userData.tick(t,dt);
 fartherTrees.forEach((g,i)=>g.userData.tick(t+i*4,dt));
 mist.userData.tick(t,dt);
 const torchOn=game.camera.children.some(c=>c.isSpotLight&&c.intensity>90);
 mist.userData.setGlow(.35+(torchOn?.52:0)+approach*.55);
}
requestAnimationFrame(frame);
