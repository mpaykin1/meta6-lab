// Load original GLB files from the approved Sunken City source without duplicating geometry.
// Works from GitHub Pages; provide Three.js r160 and a GLTFLoader instance yourself.
const modelDir=new URL('../../../../underwater-sumerek/glb/',import.meta.url);
const base=new URL('./',import.meta.url);
let manifestPromise;
const byteCache=new Map();
export async function listOriginalModels(){
  if(!manifestPromise)manifestPromise=fetch(new URL('model-index.json',base))
    .then(r=>{if(!r.ok)throw Error('Model index HTTP '+r.status);return r.json()})
    .catch(e=>{manifestPromise=null;throw e});
  return (await manifestPromise).models;
}
export async function getOriginalModelBytes(name){
  const rec=(await listOriginalModels()).find(m=>m.name===name&&m.present);
  if(!rec)throw Error('Unknown approved GLB: '+name);
  if(!byteCache.has(name)){
    const task=(rec.binary_glb_path
      ? fetch(new URL(rec.binary_glb_path,new URL('../../../../',import.meta.url)))
          .then(r=>{if(!r.ok)throw Error('GLB binary '+name+' HTTP '+r.status);return r.arrayBuffer()})
      : fetch(new URL(name+'.json',modelDir))
          .then(r=>{if(!r.ok)throw Error('GLB JSON '+name+' HTTP '+r.status);return r.json()})
          .then(data=>{
            if(typeof data.glb!=='string'||!data.glb.startsWith('Z2xURg'))throw Error('Bad GLB content for '+name);
            const str=atob(data.glb),bytes=new Uint8Array(str.length);
            for(let i=0;i<str.length;i++)bytes[i]=str.charCodeAt(i);
            return bytes.buffer;
          })
    ).then(buffer=>{
      if(buffer.byteLength<12)throw Error('GLB truncated: '+name);
      const dv=new DataView(buffer);
      if(dv.getUint32(0,true)!==0x46546c67||dv.getUint32(4,true)!==2||dv.getUint32(8,true)!==buffer.byteLength)
        throw Error('Invalid GLB header: '+name);
      return buffer;
    }).catch(e=>{byteCache.delete(name);throw e});
    byteCache.set(name,task);
  }
  return (await byteCache.get(name)).slice(0);
}
export async function loadOriginalGLB(name,{loader}={}){
  if(!loader||typeof loader.parseAsync!=='function')throw Error('A THREE.GLTFLoader instance is required');
  return loader.parseAsync(await getOriginalModelBytes(name),'');
}
export async function createOriginalModel(name,{THREE,loader,scene,autoplay=true,animation,scale=1}={}){
  if(!THREE?.AnimationMixer||!loader)throw Error('THREE and GLTFLoader are required');
  const gltf=await loadOriginalGLB(name,{loader});
  // Every call parses a separate GLTF; its skeleton, materials and animations are independent.
  const root=gltf.scene;
  root.scale.multiplyScalar(scale);
  if(scene)scene.add(root);
  const mixer=new THREE.AnimationMixer(root);
  const clip=gltf.animations.find(a=>a.name===animation)||gltf.animations.find(a=>/idle|swim|pulse|hover|sway/i.test(a.name))||gltf.animations[0]||null;
  if(clip&&autoplay)mixer.clipAction(clip).play();
  return {root,gltf,animations:gltf.animations,mixer,update(delta){mixer.update(Math.max(0,delta))},play(name){const c=gltf.animations.find(a=>a.name===name)||clip;if(c)mixer.clipAction(c).play()},stop(){mixer.stopAllAction()},dispose(){
    mixer.stopAllAction();if(scene)scene.remove(root);
    const geos=new Set(),mats=new Set(),textures=new Set();
    root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)for(const m of (Array.isArray(o.material)?o.material:[o.material]))mats.add(m)});
    for(const m of mats){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose()}
    for(const g of geos)g.dispose();
    for(const t of textures)t.dispose();
  }};
}
