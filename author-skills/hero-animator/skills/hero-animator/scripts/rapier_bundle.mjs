#!/usr/bin/env node
/** Bundle real game JS and Rapier's base64-embedded WASM into an inline HTML. */
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
const [entryArg,templateArg,outputArg]=process.argv.slice(2);
if(!entryArg||!templateArg||!outputArg)throw Error('Usage: node rapier_bundle.mjs <game-entry.mjs> <asset-inlined-template.html> <output.html>');
const entry=resolve(entryArg),template=resolve(templateArg),output=resolve(outputArg);
if(!existsSync(entry)||!existsSync(template))throw Error('Real game entry and single-file asset HTML template required');
const projectDir=dirname(entry),pkgPath=resolve(projectDir,'package.json');
if(!existsSync(pkgPath))throw Error('Game project must contain package.json pinned to Rapier 0.21.0');
const pkg=JSON.parse(readFileSync(pkgPath,'utf8'));
if(pkg.dependencies?.['@dimforge/rapier3d-compat']!=='0.21.0')throw Error('Rapier version must be pinned to 0.21.0');
if(!pkg.devDependencies?.esbuild)throw Error('esbuild must be declared in package.json');
function run(exe,args){const p=spawnSync(exe,args,{cwd:projectDir,stdio:'inherit',shell:process.platform==='win32'});
 if(p.error||p.status!==0)throw Error(`${exe} ${args.join(' ')} failed: ${p.error?.message??p.status}`);}
if(!existsSync(resolve(projectDir,'node_modules','@dimforge','rapier3d-compat','package.json')))
  run('npm',['install','--ignore-scripts','--no-audit','--no-fund']);
const {build}=await import(resolve(projectDir,'node_modules','esbuild','lib','main.js'));
const buildResult=await build({entryPoints:[entry],bundle:true,format:'iife',platform:'browser',target:'es2022',minify:true,write:false,logLevel:'warning',absWorkingDir:projectDir});
if(buildResult.outputFiles.length!==1)throw Error('Expected exactly one JS bundle');
const html=readFileSync(template,'utf8'),marker='<!-- HERO_ANIMATOR_INLINE_MODULE -->';
if(!html.includes(marker))throw Error('HTML lacks inline module marker: never ship a blank game');
const js=buildResult.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const result=html.replace(marker,`<script>${js}</script>`);
if(/<script[^>]*src\s*=|<link[^>]*href\s*=|<img[^>]*src\s*=\s*['"]https?:/i.test(result))throw Error('External assets detected. Inline them first.');
mkdirSync(dirname(output),{recursive:true});writeFileSync(output,result,'utf8');
console.log(output);
