/* META GAMES skin runtime — one-time allocation, animation transforms only. */
(function(root){
"use strict";
const TYPES=new Set(["rotate","bob","swing","chain","pulse","flicker","flipbook","orbit","flap"]);
function source(rootUrl,p){return new URL(p,rootUrl).href;}
async function load(url,THREE){
 const base=new URL(url.endsWith("/")?url:url+"/",location.href);
 const response=await fetch(new URL("skin.json",base));
 if(!response.ok)throw Error("Skin manifest HTTP "+response.status);
 const manifest=await response.json();
 if(manifest.format!=="meta6-skin/1")throw Error("Unsupported skin "+manifest.format);
 const loader=new THREE.TextureLoader(), cache=new Map();
 const paths=new Set();
 for(const t of manifest.textures||[]){paths.add(t.file);if(t.emit)paths.add(t.emit);}
 for(const p of manifest.parts||[]){if(p.file)paths.add(p.file);}
 await Promise.all([...paths].map(async path=>{
  const tex=await new Promise((ok,no)=>loader.load(source(base,path),ok,undefined,no));
  tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;
  tex.generateMipmaps=false;tex.encoding=THREE.sRGBEncoding;
  tex.wrapS=THREE.ClampToEdgeWrapping;tex.wrapT=THREE.ClampToEdgeWrapping;
  tex.needsUpdate=true;cache.set(path,tex);
 }));
 const entries=[], tempM=new THREE.Matrix4(),tmpQ=new THREE.Quaternion();
 let rig=null;
 function material(name,map,emit){
  const def=manifest.materials?.[name]||{}, additive=def.blend==="additive";
  // Художественный PNG должен оставаться цветовой текстурой, а не
  // превращаться в раскалённую маску свечения. Альфа сохраняет выломы.
  const opts={map:map||null,transparent:additive||!!map,alphaTest:map?.025:0,
   depthWrite:!additive,side:THREE.DoubleSide,
   blending:additive?THREE.AdditiveBlending:THREE.NormalBlending};
  if(additive)return new THREE.MeshBasicMaterial({...opts,color:0xffffff,
   opacity:.82,depthWrite:false});
  return new THREE.MeshLambertMaterial({...opts,color:def.color||0xffffff,
   emissive:new THREE.Color(def.emissive||0x000000),
   emissiveMap:emit||null,emissiveIntensity:emit?.3:0});
 }
 function geometry(p){
  const d=p.dims||[.12,.12,.12];
  if(p.primitive==="sphere")return new THREE.SphereGeometry(d[0]/2,12,8);
  if(p.primitive==="cylinder")return new THREE.CylinderGeometry(d[0]/2,d[0]/2,d[1],10);
  if(p.primitive==="torus")return new THREE.TorusGeometry(d[0]/2,Math.max(.01,d[1]||.02),6,16);
  return new THREE.BoxGeometry(...d);
 }
 function apply(RIG){
  if(rig)throw Error("Skin already applied");
  rig=RIG;
  for(const bone of manifest.hideBase||[]){
   for(const m of RIG.base?.[bone]||[]){
    if(m.isMesh&&m.material){
     const old=m.material;
     m.material=Array.isArray(old)?old.map(x=>{const c=x.clone();c.visible=false;return c;}):old.clone();
     if(!Array.isArray(m.material))m.material.visible=false;
    }
   }
  }
  for(const t of manifest.textures||[]){
   const obj=RIG.bones?.[t.apply]; if(!obj||!obj.isMesh)continue;
   const mat=material(t.material,cache.get(t.file),t.emit?cache.get(t.emit):null);
   obj.material=mat;
  }
  for(const p of manifest.parts||[]){
   const bone=RIG.bones?.[p.bone]||RIG.root;
   if(!bone)throw Error("Missing bone "+p.bone);
   const group=new THREE.Group();
   const offset=p.offset||[0,0,0],rot=p.rotation||[0,0,0];
   group.position.set(...offset);group.rotation.set(...rot);bone.add(group);
   const animations=(p.anim||[]).filter(a=>TYPES.has(a.type));
   let tex=p.file?cache.get(p.file):null;
   const flip=animations.find(a=>a.type==="flipbook");
   if(flip&&tex){tex=tex.clone();tex.repeat.set(1/flip.frames,1);tex.offset.set(0,0);tex.needsUpdate=true;}
   const mat=material(p.material,tex,null);
   // Авторские PNG показываются одним слоем: повторные полупрозрачные
   // плоскости создавали z-fighting и уничтожали мелкие механические детали.
   if(tex){mat.depthWrite=true;mat.polygonOffset=true;mat.polygonOffsetFactor=-1;mat.polygonOffsetUnits=-1;}
   const layer=p.layer||"2.5d";
   const d=p.size||[.12,.12];
   let mesh;
   if(layer==="3d"){
    mesh=new THREE.Mesh(geometry(p),mat);group.add(mesh);
   }else if(p.profileVolume && tex){
    // Only side/back profiles use textured volume. Accepted frontal decals
    // remain unchanged. The author PNG is mapped to the visible side face.
    const thick=Math.max(.055,Math.min(.18,p.profileVolume));
    const geo=new THREE.BoxGeometry(d[0],d[1],thick);
    mesh=new THREE.Mesh(geo,mat);
    group.add(mesh);
   }else{
    const geo=new THREE.PlaneGeometry(d[0],d[1]);
    const depth=layer==="2.5d"?(p.file?1:Math.min(5,Math.max(1,p.depth||1))):1;
    mesh=new THREE.InstancedMesh(geo,mat,depth);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for(let i=0;i<depth;i++){tempM.makeTranslation(0,0,i*.008);mesh.setMatrixAt(i,tempM);}
    mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;group.add(mesh);
    if(layer==="2d"){
     const q=new THREE.Quaternion();
     mesh.onBeforeRender=function(renderer,scene,camera){
      group.parent.getWorldQuaternion(q);
      group.quaternion.copy(q.invert().multiply(camera.quaternion));
     };
    }
   }
   entries.push({p,group,mesh,mat,tex,animations,base:[...offset],rot:[...rot],
    chain:animations.find(a=>a.type==="chain")});
  }
  return this;
 }
 function update(t,dt,ctx={}){
  const speed=Math.min(1,Math.max(0,ctx.speed||0)),pulse=Math.max(0,ctx.pulse||0),
        lean=ctx.lean||0,walk=ctx.walk||0;
  for(let i=0;i<entries.length;i++){
   const e=entries[i],g=e.group;
   g.position.set(...e.base);g.rotation.set(...e.rot);g.scale.set(1,1,1);
   let glow=1;
   for(const a of e.animations){
    const freq=a.freq||1,phase=(a.phase||0)*Math.PI*2;
    const time=t*Math.PI*2*freq*(1+speed*(a.speedLink||0))+phase;
    const val=Math.sin(time),amp=a.amp===undefined?.12:a.amp;
    if(a.type==="rotate")g.rotation[a.axis||"z"]+=time*(a.clockwise===false?-1:1);
    else if(a.type==="bob")g.position.y+=val*amp;
    else if(a.type==="swing")g.rotation.z+=(val*amp+lean*(a.inertia||0))*Math.min(1,.4+speed);
    else if(a.type==="orbit"){g.position.x+=Math.cos(time)*amp;g.position.y+=val*amp;}
    else if(a.type==="flap")g.rotation.x+=val*amp;
    else if(a.type==="pulse")glow*=.75+.25*val+Math.max(0,pulse)*(a.pulseLink||0);
    else if(a.type==="flicker")glow*=.8+.2*Math.sin(time*2.13)+Math.max(0,pulse)*(a.pulseLink||0);
    else if(a.type==="flipbook"&&e.tex){
     const frames=Math.max(1,a.frames||1),duty=a.duty??1;
     const cycle=((t*(a.fps||8)+(a.phase||0)*frames)%frames+frames)%frames;
     e.tex.offset.x=Math.floor(cycle)/frames;
     glow*=cycle/frames<=duty?1:0;
    }
    else if(a.type==="chain"){
     const n=Math.max(3,Math.min(6,a.segments||4));
     for(let j=0;j<e.mesh.count;j++){
      const u=j/Math.max(1,n-1),w=Math.sin(time-j*(a.lag||.6));
      tempM.makeTranslation(w*amp*u,-u*(e.p.size?.[1]||.22),j*.005);
      e.mesh.setMatrixAt(j,tempM);
     }
     e.mesh.instanceMatrix.needsUpdate=true;
    }
   }
   if(e.mat.blending===THREE.AdditiveBlending){e.mat.opacity=Math.max(0,Math.min(1,glow));e.mat.transparent=true;}
   else if(e.mat.emissiveIntensity!==undefined)e.mat.emissiveIntensity=Math.max(0,Math.min(4,glow));
   if(e.p.walkLink)g.position.y+=Math.sin(walk+(e.p.anim?.[0]?.phase||0)*Math.PI*2)*speed*.025;
  }
 }
 return {manifest,apply,update,dispose(){for(const e of entries){e.mesh.geometry.dispose();e.mat.dispose();} for(const t of cache.values())t.dispose();}};
}
root.SkinRuntime={load};
})(typeof window!=="undefined"?window:globalThis);
