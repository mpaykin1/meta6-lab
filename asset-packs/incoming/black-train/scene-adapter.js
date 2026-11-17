// Standalone copy of the Night Scream game: source stays untouched.
// Only objects from the order are added; all existing enemy behaviour is preserved.
import '../../../reference/ink-night-scream/src/scene.js';
import {makers} from './makers.js';
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
const tree=put('gnarledTree',31,[-6.3,0,-13.2]);
const mist=put('groundMist',16,[1.3,0,-6.2]);
// Three asymmetrical specimens rather than a wall of repeated identical trees.
const fartherTrees=[makers.gnarledTree(73),makers.gnarledTree(129)];
fartherTrees[0].position.set(9.8,0,-19.0);
fartherTrees[1].position.set(-14.5,0,-25.0);
scene.add(...fartherTrees);
const oldLoco=train.userData.rig.loco;
let lastActive=false,lastX=0,variant=false,last=performance.now();
const originalVisible=Object.fromEntries(Object.keys(assets).map(k=>[k,true]));
window.__ISOLATE__=(id,on)=>{
 if(!Object.hasOwn(assets,id))return false;
 originalVisible[id]=!!on;assets[id].visible=!!on;return true;
};
window.__PACK__={items:Object.keys(assets).map(id=>({id,label:id}))};
window.__BLACK_TRAIN_ASSETS__={scene,assets,fartherTrees,order:15,created:6,
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
 const t=now*.001;
 if(black.visible)black.userData.tick(t,dt);
 crossing.userData.tick?.(t,dt);
 chains.userData.tick(t,dt);
 tree.userData.tick(t,dt);
 fartherTrees.forEach((g,i)=>g.userData.tick(t+i*4,dt));
 mist.userData.tick(t,dt);
 mist.userData.setGlow(.66+(approach*.65));
}
requestAnimationFrame(frame);
