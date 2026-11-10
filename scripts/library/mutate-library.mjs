import fs from 'node:fs';
import path from 'node:path';
import {ROOT,buildLibrary} from './machine.mjs';
import {makeFixture,verifyLibrary} from './verify-library.mjs';

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const write=(file,data)=>fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
const mutateByte=file=>{const x=fs.readFileSync(file);x[x.length-1]^=1;fs.writeFileSync(file,x);};
const scenarios=[
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
  ['deception-frozen-index-for-skin-trainer',root=>{
    const next=path.join(root,'games/skin-trainer');
    fs.mkdirSync(next,{recursive:true});
    fs.writeFileSync(path.join(next,'index.html'),'<style>canvas{color:orange}</style><script>function walkRobot(){return true;}</script>');
    fs.writeFileSync(path.join(next,'skin.png'),Buffer.from([137,80,78,71,13,10,26,10,3,2,1]));
    // A newly added source must invalidate an unrebuilt index, including a skin training game.
  }],
  ['deception-copy-game-forced-into-index',root=>{
    const dir=path.join(root,'games/base-copy');
    fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,'index.html'),'<style>canvas{color:grey}</style><script>function copy(){return 1;}</script>');
    const indexFile=path.join(root,'shared/library/index.json');
    const index=read(indexFile);
    index.games.push({...index.games.find(g=>g.game==='base'),game:'base-copy',source_root:'games/base-copy',manifest:'shared/library/base-copy.json'});
    write(indexFile,index);
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
