#!/usr/bin/env node
/**
 * Prepare a new/compatible game project from the ONE Hero Animator skill.
 * Copies runtime modules into the game's source tree so real npm runtime
 * packages resolve from that game, rather than from the plugin installation.
 * Does not touch approved art, atlases, level geometry or game logic.
 * Does not silently overwrite conflicting versions or modified runtime files.
 * Usage: node scripts/prepare_postfx_game.mjs /absolute/path/to/game
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const target=process.argv[2] && resolve(process.argv[2]);
if (!target)throw Error('Usage: node scripts/prepare_postfx_game.mjs <game-directory>');
if(target===root || target.startsWith(root+'/') || target.startsWith(root+'\\'))
  throw Error('Game project must be outside the skill source tree');
const deps={
  '@dimforge/rapier3d-compat':'0.21.0',
  postprocessing:'6.39.6',
  three:'0.180.0'
};
const dev={esbuild:'0.25.5'};
mkdirSync(target,{recursive:true});
const pkgPath=join(target,'package.json');
let pkg=existsSync(pkgPath)?JSON.parse(readFileSync(pkgPath,'utf8')):{
  name:'hero-animator-game',private:true,version:'0.12.0',type:'module'
};
for (const [name,value] of Object.entries(deps)){
  const installed=pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];
  if(installed && installed!==value)throw Error(`Incompatible ${name} ${installed}; require ${value}. Update game deliberately.`);
}
for (const [name,value] of Object.entries(dev)){
  const installed=pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];
  if(installed && installed!==value)throw Error(`Incompatible ${name} ${installed}; require ${value}.`);
}
// Plan writes before performing them, so no package changes on conflicts.
const modules=[
  'hero-hybrid.mjs',
  'directional-controller.mjs',
  'rapier-world.mjs',
  'rapier-directional-controller.mjs',
  'hero-postfx.mjs',
  'hero-rapier-postfx-loop.mjs',
  'gltf-rapier-scene.mjs'
];
const dest=join(target,'src','hero-animator');
const hash=buf=>createHash('sha256').update(buf).digest('hex');
for(const name of modules){
  const source=join(root,'runtime',name),destination=join(dest,name);
  if(!existsSync(source))throw Error(`Skill runtime missing: ${name}`);
  if(existsSync(destination) && hash(readFileSync(destination))!==hash(readFileSync(source)))
    throw Error(`Refusing to replace modified game runtime: ${destination}`);
}
pkg.dependencies={...pkg.dependencies,...deps};
pkg.devDependencies={...pkg.devDependencies,...dev};
pkg.type='module';
mkdirSync(dest,{recursive:true});
for(const name of modules)copyFileSync(join(root,'runtime',name),join(dest,name));
writeFileSync(pkgPath,JSON.stringify(pkg,null,2)+'\n','utf8');
console.log(`Prepared ${dest}: real Rapier+Three+postprocessing+glTF loader; bundle dependencies with verified approved art and real colliders.`);
