import fs from 'node:fs';
import path from 'node:path';
import {ROOT,buildLibrary} from './machine.mjs';
import {makeFixture,verifyLibrary} from './verify-library.mjs';

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const write=(file,data)=>fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
const mutateByte=file=>{const x=fs.readFileSync(file);x[x.length-1]^=1;fs.writeFileSync(file,x);};
function inventoryFixture(root){
  const source=path.join(root,'reference/inventory-example');
  fs.mkdirSync(source,{recursive:true});
  fs.writeFileSync(path.join(source,'index.html'),
    '<style>canvas{color:gold}</style><script>function jump(){return 3;}</script>');
  fs.writeFileSync(path.join(source,'hero.png'),Buffer.from([137,80,78,71,13,10,26,10,1,7,9]));
  fs.mkdirSync(path.join(root,'docs'),{recursive:true});
  fs.writeFileSync(path.join(root,'docs/INVENTORY_LAB_GAMES_2026-11-10.md'),
    '| 19 | Owner reference | `reference/inventory-example/` | yes | no |\n'+
    '| 20 | Alias | `reference/inventory-example/` | yes | no |\n');
  return root;
}
const scenarios=[
  ['inventory-source-omitted',root=>{
    const file=path.join(root,'shared/library/index.json'),index=read(file);
    index.games=index.games.filter(g=>g.source_root!=='reference/inventory-example');
    write(file,index);
  }],
  ['deception-inventory-source-and-evidence-erased',root=>{
    const file=path.join(root,'shared/library/index.json'),index=read(file);
    const entry=index.games.find(g=>g.source_root==='reference/inventory-example');
    if(!entry)throw Error('Inventory fixture was not discovered');
    index.games=index.games.filter(g=>g.game!==entry.game);
    index.entries=index.entries.filter(e=>e.game!==entry.game);
    fs.rmSync(path.join(root,entry.manifest));
    write(file,index);
  }],
  ['deception-inventory-manifest-points-to-other-source',root=>{
    const index=read(path.join(root,'shared/library/index.json'));
    const entry=index.games.find(g=>g.source_root==='reference/inventory-example');
    const file=path.join(root,entry.manifest),manifest=read(file);
    manifest.source_root='games/base';
    write(file,manifest);
  }],
  ['copy-one-byte-changed',root=>{
    const asset=read(path.join(root,'shared/library/base.json')).assets.find(x=>x.storage==='copy');
    if(!asset)throw Error('Fixture missing copied asset');
    mutateByte(path.join(root,asset.copy_path));
  }],
  ['deception-similar-asset-from-another-game',root=>{
    const other=path.join(root,'games/other');
    fs.mkdirSync(other,{recursive:true});
    fs.writeFileSync(path.join(other,'index.html'),'<style>canvas{color:blue}</style><script>function fight(){return 2;}</script>');
    fs.writeFileSync(path.join(other,'ship.png'),Buffer.from([137,80,78,71,13,10,26,10,9,9,9,9]));
    buildLibrary(root);
    const base=read(path.join(root,'shared/library/base.json')).assets.find(a=>a.source_path.endsWith('/ship.png'));
    const alternate=read(path.join(root,'shared/library/other.json')).assets.find(a=>a.source_path.endsWith('/ship.png'));
    fs.copyFileSync(path.join(root,alternate.copy_path),path.join(root,base.copy_path));
  }],
  ['missing-code-source-or-wrong-line-range',root=>{
    const file=path.join(root,'shared/library/base.json'),m=read(file);
    m.solutions[0].lines=[999999,999999];
    write(file,m);
  }],
  ['deception-frozen-index-for-new-game',root=>{
    const next=path.join(root,'games/newly-uploaded');
    fs.mkdirSync(next,{recursive:true});
    fs.writeFileSync(path.join(next,'index.html'),'<style>canvas{color:gold}</style><script>function followCamera(){return 1;}</script>');
    fs.writeFileSync(path.join(next,'new.png'),Buffer.from([137,80,78,71,13,10,26,10,4,5,6]));
    // A hardcoded index deliberately remains unchanged.
  }],
  ['missing-file-asset-with-cleaned-index',root=>{
    const mf=path.join(root,'shared/library/base.json'),ix=path.join(root,'shared/library/index.json');
    const m=read(mf),index=read(ix),removed=m.assets.find(a=>a.bytes!==undefined);
    m.assets=m.assets.filter(a=>a.id!==removed.id);
    m.counts.assets--;m.counts.file_assets--;
    index.entries=index.entries.filter(e=>e.id!==removed.id);
    const game=index.games.find(g=>g.game==='base');
    game.assets--;game.file_assets--;
    index.copied_bytes-=removed.bytes;
    if(removed.copy_path)fs.rmSync(path.join(root,removed.copy_path));
    write(mf,m);write(ix,index);
  }]
];
let passed=0;
for(const [name,damage] of scenarios){
  const root=makeFixture();
  inventoryFixture(root);
  try{
    buildLibrary(root);
    verifyLibrary(root,{live:false});
    damage(root);
    let caught=false;
    try{verifyLibrary(root,{live:false});}catch{caught=true;}
    if(!caught)throw Error('Mutation escaped verification: '+name);
    console.log('CAUGHT '+name);passed++;
  }finally{fs.rmSync(root,{recursive:true,force:true});}
}
if(passed!==scenarios.length)throw Error('Mutation set incomplete');
console.log('ALL '+passed+' LIBRARY MUTATIONS CAUGHT');

// A prior successful verification must not hide later source mutations.
for(const [name,change] of [
  ['same-length-source-edit',s=>s.replace('return true','return null')],
  ['style-source-edit',s=>s.replace('display:block','display:table')],
  ['stale-manifest-hash-deception',s=>s.replace('moveHero','moveHera')]
]){
  const root=makeFixture();
  try{
    buildLibrary(root);
    verifyLibrary(root,{live:false});
    const file=path.join(root,'games/base/index.html'),before=fs.readFileSync(file,'utf8');
    const after=change(before);
    if(after===before)throw Error('Cache fixture did not mutate: '+name);
    fs.writeFileSync(file,after);
    let caught=false;
    try{verifyLibrary(root,{live:false});}
    catch(error){
      if(!/source code\/table range SHA-256 mismatch/.test(error.message))throw error;
      caught=true;
    }
    if(!caught)throw Error('Stale source cache escaped verification: '+name);
    console.log('CAUGHT '+name);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
}
console.log('ALL 3 SOURCE CACHE MUTATIONS CAUGHT');
