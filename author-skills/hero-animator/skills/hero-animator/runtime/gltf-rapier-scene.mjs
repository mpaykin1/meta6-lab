/**
 * Hero Animator world-asset bridge. GLB is rendered by Three.js, author-exported
 * COLLIDER_ meshes become real Rapier fixed trimeshes from source vertices.
 * Doesn't touch actor RGBA sheets, state, input, or the 3D physics tick.
 * Dependencies resolve from the GAME's existing three@0.180.0 package.
 */
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export async function loadGLBIntoRapierWorld({url,scene,physics,
  colliderManifestURL=url+'.colliders.json',metadataURL=url+'.hero.json',requireColliders=true,fetchImpl=fetch}={}){
  if(!url||!scene?.add||!physics?.addStaticTrimesh)throw Error('GLB url, THREE scene and actual Rapier physics required');
  const loader=new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf=await loader.loadAsync(url);
  if(!gltf.scene)throw Error('GLB does not contain a THREE scene');
  const response=await fetchImpl(colliderManifestURL);
  if(!response.ok)throw Error(`Rapier collision manifest missing: ${response.status}`);
  const manifest=await response.json();
  const metadataResponse=await fetchImpl(metadataURL);
  if(!metadataResponse.ok)throw Error(`GLB integrity metadata missing: ${metadataResponse.status}`);
  const metadata=await metadataResponse.json();
  if(metadata?.schema!=='hero-gltf-v1'||!metadata.output_sha256
    ||metadata.input_sha256!==manifest.source_sha256)throw Error('GLB/collider manifests do not match source asset');
  if(manifest?.schema!=='hero-rapier-colliders-v1'||!Array.isArray(manifest.items))throw Error('Invalid Rapier collider manifest');
  if(requireColliders&&manifest.items.length===0)throw Error('No real 3D colliders in GLB; cannot start playable scene');
  const physicsMeshes=[];
  // Validate before adding to world; avoid introducing half a level on invalid data.
  for(const obj of manifest.items){
    if(!/^COLLIDER_/i.test(obj.name||'')||!Array.isArray(obj.vertices)||!Array.isArray(obj.indices)
      ||obj.vertices.length<9||obj.indices.length<3||obj.vertices.length%3||obj.indices.length%3
      ||obj.vertices.some(x=>!Number.isFinite(x))
      ||obj.indices.some(x=>!Number.isInteger(x)||x<0||x>=obj.vertices.length/3))
      throw Error(`Invalid source collider ${obj.name||'unknown'}`);
    physicsMeshes.push({vertices:Float32Array.from(obj.vertices),indices:Uint32Array.from(obj.indices),
      tag:obj.tag==='terrain'?'terrain':'obstacle',data:{sourceNode:obj.name}});
  }
  // Physically represented collider proxy meshes are not supposed to be visible.
  gltf.scene.traverse(node=>{if(/^COLLIDER_/i.test(node.name||''))node.visible=false;});
  // Parent transforms must remain unchanged; collider vertices are WORLD coordinates.
  if(gltf.scene.position.lengthSq?.()!==undefined && gltf.scene.position.lengthSq()>1e-8)
    throw Error('Do not move GLB root after collider export: world-space collider alignment required');
  const registered=[];
  for(const body of physicsMeshes)registered.push(physics.addStaticTrimesh(body));
  scene.add(gltf.scene);
  return {root:gltf.scene,colliders:registered,gltf};
}
