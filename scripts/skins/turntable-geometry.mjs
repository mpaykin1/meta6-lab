// Shared, dependency-free volume and material assertions for KONTUR mutations.
import {LIMITS} from './turntable-thresholds.mjs';
const fail=msg=>{throw Error('TURNTABLE FAIL: '+msg);};
const ANCHORS={
 body:[0,1,0],head:[0,1.75,0],armL:[-.38,1.32,0],armR:[.38,1.32,0],
 legL:[-.15,.62,0],legR:[.15,.62,0]
};
const DIM=['right','left','top','bottom','back','front'];
function boxesOverlap(a,b){
 return [0,1,2].every(i=>Math.abs(a.center[i]-b.center[i])<=
 (a.dims[i]+b.dims[i])/2+.012);
}
export function inspectGeometry(manifest){
 if(!Array.isArray(manifest.parts)||manifest.parts.length<6)fail('missing actual geometry');
 const solids=manifest.parts.filter(p=>p.layer==='3d');
 const boxes={};
 for(const bone of Object.keys(ANCHORS)){
  const candidates=solids.filter(p=>p.bone===bone);
  if(!candidates.length)fail('missing solid bone '+bone);
  // One continuous primary volume per bone, not thin decorative plates.
  const p=candidates.find(x=>x.id==='volume-'+bone)||candidates[0];
  if(bone==='head'&&p.primitive!=='sphere')fail('head must be a complete sphere');
  if(bone!=='head'&&p.primitive!=='box')fail('body and limbs require solid boxes: '+bone);
  if(!p.dims||p.dims.some(v=>!(v>0)))fail('zero-size volume '+bone);
  if(p.dims[2]<p.dims[0]*LIMITS.bodyDepthToWidth)fail('paper-thin box '+bone);
  if(p.outline!==true)fail('inverted hull outline missing '+bone);
  if(p.emissiveMap||p.material==='glow'||manifest.materials?.[p.material]?.emissiveMap)
   fail('emissiveMap or glow on armor '+bone);
  if(!p.faces||DIM.some(f=>!p.faces[f]||!p.faces[f].startsWith('textures/')))
   fail('missing baked independent faces '+bone);
  if(bone==='head'&&!p.faces.panorama?.startsWith('textures/'))
   fail('sphere must carry a separate 360 degree texture atlas');
  const front=manifest.parts.find(x=>x.id===p.id+'-front-art');
  if(!front?.file||front.layer!=='2.5d')fail('front artwork must be embossed '+bone);
  if(['left','right','back'].some(f=>p.faces[f]===front.file||
     p.faces[f]===p.faces.front))fail('copy of front image on sides/back '+bone);
  if(p.faces.left===p.faces.right)fail('baked left and right shades not independent '+bone);
  if(p.rotation?.some(v=>Math.abs(v)>0.01))fail('rotated primary volume '+bone);
  boxes[bone]={center:ANCHORS[bone].map((v,i)=>v+(p.offset?.[i]||0)),dims:p.dims};
 }
 const body=boxes.body;
 for(const bone of ['head','armL','armR','legL','legR'])
  if(!boxesOverlap(body,boxes[bone]))fail('disconnected joint between body and '+bone);
 for(const p of manifest.parts){
  if(/-side-(left|right)$|-profile-(left|right)$/.test(p.id)||p.profileVolume!==undefined)
   fail('forbidden paper side plane '+p.id);
  if(p.layer==='3d'&&(p.emissiveMap||p.material==='glow'))
   fail('emissiveMap on armor '+p.id);
 }
 return true;
}
