#!/usr/bin/env node
/**
 * Hero Animator glTF-Transform 4.5.1 build-stage adapter.
 * Read original GLB, capture collision source geometry BEFORE quantization,
 * optimize visual-only geometry, verify topology/names/material/texture invariants,
 * write new GLB + optional Rapier collision manifest. Never modify originals.
 *
 * node scripts/gltf_prepare.mjs art/world.glb game/assets/world.glb --meshopt --require-colliders
 */
import { readFile, writeFile, rename, rm, stat, mkdir } from 'node:fs/promises';
import { resolve, extname, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const finite = n => Number.isFinite(n) && Math.abs(n) < 1e12;
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
function args(argv) {
  const flags = new Set(argv.filter(a => a.startsWith('--')));
  if (argv.length < 2 || [...flags].some(x => !['--meshopt','--require-colliders'].includes(x))) {
    throw Error('Usage: node scripts/gltf_prepare.mjs INPUT.glb OUTPUT.glb [--meshopt] [--require-colliders]');
  }
  const src = resolve(argv[0]), out = resolve(argv[1]);
  if (src === out || extname(src).toLowerCase() !== '.glb' || extname(out).toLowerCase() !== '.glb') {
    throw Error('Input and output must be different .glb files');
  }
  return {src, out, meshopt:flags.has('--meshopt'), requireColliders:flags.has('--require-colliders')};
}
function snapshot(doc) {
  const root = doc.getRoot();
  // Node transforms, meshes, names, hierarchy, textures and material alpha state are immutable.
  const nodes = root.listNodes().map(n => ({name:n.getName(), parent:n.getParent()?.propertyType==='Node'?n.getParent()?.getName():null,
    mesh:n.getMesh()?.getName()??null, skin:n.getSkin()?.getName()??null,
    matrix:Array.from(n.getWorldMatrix(),x=>Number(x.toFixed(6)))}));
  const textures = root.listTextures().map(t => ({name:t.getName(),mime:t.getMimeType(),sha:t.getImage()?sha(t.getImage()):null}));
  const materials = root.listMaterials().map(m => ({name:m.getName(),alpha:m.getAlphaMode(),cutoff:m.getAlphaCutoff(),double:m.getDoubleSided(),
    base:m.getBaseColorFactor(),baseMap:m.getBaseColorTexture()?.getName()??null}));
  const animations = root.listAnimations().map(a => ({name:a.getName(),channels:a.listChannels().length,samplers:a.listSamplers().length}));
  const counts = {nodes:nodes.length,meshes:root.listMeshes().length,primitives:root.listMeshes().reduce((v,m)=>v+m.listPrimitives().length,0),skins:root.listSkins().length};
  return {nodes,textures,materials,animations,counts};
}
function collisionGeometry(doc) {
  const glbs = [];
  for(const node of doc.getRoot().listNodes()) {
    if(!/^COLLIDER_/i.test(node.getName())) continue;
    const mesh = node.getMesh();
    if(!mesh)throw Error(`COLLIDER_ node has no mesh: ${node.getName()}`);
    const mat = node.getWorldMatrix(); // glTF column-major 4x4; physics uses same world coordinates.
    const verts=[], indices=[];
    for(const primitive of mesh.listPrimitives()) {
      if(primitive.getMode()!==4)throw Error(`Collider ${node.getName()}: only TRIANGLES supported`);
      const positions = primitive.getAttribute('POSITION');
      if(!positions)throw Error(`Collider ${node.getName()} has no POSITION`);
      const offset = verts.length/3;
      const xyz = [0,0,0];
      for(let i=0;i<positions.getCount();i++) {
        positions.getElement(i, xyz);
        const [x,y,z]=xyz;
        const w=mat[3]*x+mat[7]*y+mat[11]*z+mat[15];
        if(!finite(w)||Math.abs(w)<1e-8)throw Error('Invalid collider transform');
        const p=[(mat[0]*x+mat[4]*y+mat[8]*z+mat[12])/w,
          (mat[1]*x+mat[5]*y+mat[9]*z+mat[13])/w,
          (mat[2]*x+mat[6]*y+mat[10]*z+mat[14])/w];
        if(!p.every(finite))throw Error('Non-finite collider coordinates');
        verts.push(...p);
      }
      const accessor=primitive.getIndices();
      let local=accessor?Array.from(accessor.getArray()):Array.from({length:positions.getCount()},(_,i)=>i);
      if(local.length%3!==0||local.some(i=>!Number.isInteger(i)||i<0||i>=positions.getCount())) {
        throw Error(`Invalid triangle indices: ${node.getName()}`);
      }
      // Inverted winding under negative determinant would only affect one-sided queries.
      for(const index of local)indices.push(index+offset);
    }
    if(verts.length<9||verts.length>1.5e6)throw Error(`Collider geometry out of bounds: ${node.getName()}`);
    glbs.push({name:node.getName(),tag:/^COLLIDER_TERRAIN/i.test(node.getName())?'terrain':'obstacle',
      vertices:verts,indices,position:{x:0,y:0,z:0}});
  }
  return glbs;
}

async function main(){
  const a=args(process.argv.slice(2));
  await stat(a.src);
  // A new version of an environment asset must use a fresh output path.
  for(const target of [a.out,a.out+'.hero.json',a.out+'.colliders.json']) {
    try { await stat(target); throw Error('Refusing to replace existing game asset: '+target); }
    catch(error) { if(error.code!=='ENOENT') throw error; }
  }
  await MeshoptDecoder.ready;
  await MeshoptEncoder.ready;
  const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'meshopt.decoder':MeshoptDecoder, 'meshopt.encoder':MeshoptEncoder,
  });
  const doc=await io.read(a.src);
  const before=snapshot(doc), colliders=collisionGeometry(doc);
  if(a.requireColliders&&!colliders.length)throw Error('No COLLIDER_ mesh: cannot assert physical world readiness');
  if(a.meshopt && (before.animations.length || before.counts.skins))
    throw Error('Meshopt compression is allowed for STATIC environment GLB only; keep rigged/animated models unchanged');
  if(a.meshopt && doc.getRoot().listMeshes().some(m=>m.listPrimitives().some(p=>p.listTargets().length)))
    throw Error('Morph targets detected: static environment only');
  await doc.transform(dedup({propertyTypes:[PropertyType.ACCESSOR],keepUniqueNames:true}));
  if(a.meshopt)await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium'}));
  await mkdir(dirname(a.out),{recursive:true});
  const temp=a.out+'.hero-tmp-'+process.pid;
  try {
    await io.write(temp+'.glb',doc);
    const check=await io.read(temp+'.glb');
    const after=snapshot(check);
    if(!same(before,after))throw Error('GLB invariant changed: node transforms / hierarchy / textures / alpha / animations. Refusing replacement.');
    const outputBytes=await readFile(temp+'.glb');
    // Never make the visual asset bigger; still keep the originals unchanged.
    const inputBytes=await readFile(a.src);
    const used=inputBytes.length<outputBytes.length?inputBytes:outputBytes;
    const mode=used===inputBytes?'original-smaller':(a.meshopt?'meshopt':'dedup');
    if(used===inputBytes)await writeFile(temp+'.glb',inputBytes);
    await rename(temp+'.glb',a.out);
    const manifest={schema:'hero-gltf-v1',input_sha256:sha(inputBytes),output_sha256:sha(used),
      input_bytes:inputBytes.length,output_bytes:used.length,mode,
      static_colliders:colliders.length,source_geometry_sha256:sha(Buffer.from(JSON.stringify(colliders))) };
    await writeFile(a.out+'.hero.json',JSON.stringify(manifest,null,2)+'\n');
    await writeFile(a.out+'.colliders.json',JSON.stringify({schema:'hero-rapier-colliders-v1',
      source_sha256:sha(inputBytes),items:colliders})+'\n');
    console.log(`GLB READY (${mode}) ${inputBytes.length} -> ${used.length} bytes; ${colliders.length} source-accurate Rapier collider mesh(es)`);
  } finally {await rm(temp+'.glb',{force:true});}
}
main().catch(err=>{console.error('BLOCKED:',err.message);process.exitCode=1;});
