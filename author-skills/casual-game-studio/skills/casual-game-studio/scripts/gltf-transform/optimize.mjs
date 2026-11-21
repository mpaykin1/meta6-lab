/**
 * Casual Game Studio build pipeline: real glTF-Transform 4.5.1 and Meshoptimizer 1.3.0.
 * --meshopt is opt-in: it applies quantization (LOSSY) plus EXT_meshopt_compression.
 * Original .bbmodel and GLB are never modified here.
 */
import { stat, rename, rm, readFile } from 'node:fs/promises';
import { resolve, dirname, basename, join } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, meshopt } from '@gltf-transform/functions';

const args = process.argv.slice(2);
const useMeshopt = args.includes('--meshopt');
const paths = args.filter(x => x !== '--meshopt');
if (paths.length !== 2) {
  console.error('Usage: node optimize.mjs input.glb output.glb [--meshopt]');
  process.exit(2);
}
const input=resolve(paths[0]), output=resolve(paths[1]);
if(input===output) throw new Error('Input and output must differ; source asset is immutable');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
let MeshoptEncoder,MeshoptDecoder;
if(useMeshopt){
  ({MeshoptEncoder,MeshoptDecoder}=await import('meshoptimizer'));
  await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
  io.registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
}
const doc=await io.read(input);
const readSummary=d=>{
  const root=d.getRoot();
  return {scenes:root.listScenes().length,animations:root.listAnimations().length,
    meshes:root.listMeshes().length,skins:root.listSkins().length,
    materials:root.listMaterials().length,textures:root.listTextures().length};
};
const before=readSummary(doc);
if(!before.scenes||!before.meshes)throw new Error('Not a 3D glTF scene');
const transforms=[dedup(),prune({keepAttributes:true,keepIndices:true,keepLeaves:true,keepSolidTextures:true})];
if(useMeshopt)transforms.push(meshopt({encoder:MeshoptEncoder,level:'medium'}));
await doc.transform(...transforms);
const after=readSummary(doc);
if(after.scenes!==before.scenes||after.meshes<1||after.animations!==before.animations||
   after.skins!==before.skins||after.textures!==before.textures){
  throw new Error('Unexpected graph/rig/animation/texture changes');
}
const temp=join(dirname(output),'.'+basename(output)+'.tmp.glb');
try{
  await io.write(temp,doc);
  const byteCount=(await stat(temp)).size;
  if(byteCount<32)throw new Error('Invalid empty output GLB');
  // A compressed file must be readable through the same official decoder.
  const verified=await io.read(temp),check=readSummary(verified);
  if(check.scenes!==before.scenes||check.animations!==before.animations||
     check.skins!==before.skins||check.textures!==before.textures||check.meshes<1){
    throw new Error('Output failed GLB readback invariants');
  }
  if(useMeshopt){
    const raw=await readFile(temp);
    if(raw.toString('ascii',0,4)!=='glTF')throw new Error('Invalid GLB magic');
    const jsonLength=raw.readUInt32LE(12), jsonType=raw.toString('ascii',16,20);
    if(jsonType!=='JSON')throw new Error('Missing GLB JSON chunk');
    const desc=JSON.parse(raw.toString('utf-8',20,20+jsonLength));
    if(!Array.isArray(desc.extensionsRequired)||!desc.extensionsRequired.includes('EXT_meshopt_compression')){
      throw new Error('Compression requested but EXT_meshopt_compression is not required in output');
    }
  }
  await rename(temp,output);
  console.log(JSON.stringify({success:true, mode:useMeshopt?'meshopt-quantized-lossy':'dedup-prune',
    bytesIn:(await stat(input)).size,bytesOut:byteCount,scenes:check.scenes,
    animations:check.animations,meshes:check.meshes,skins:check.skins}));
} finally {
  await rm(temp,{force:true});
}
