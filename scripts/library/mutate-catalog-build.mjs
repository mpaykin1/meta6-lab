import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {buildCatalog} from './catalog-systems.mjs';

const root=fs.mkdtempSync(path.join(os.tmpdir(),'meta-catalog-build-'));
try{
 const mkdir=p=>fs.mkdirSync(path.join(root,p),{recursive:true});
 mkdir('games/demo');mkdir('reference/example');mkdir('rules/06-rabota-ii-s-kodom');
 fs.writeFileSync(path.join(root,'rules/06-rabota-ii-s-kodom/META_GAMES_SOURCE_ALLOWLIST.md'),
  '## 1. Canonical\n| Game | Path |\n|---|---|\n| Example | \`reference/example/\` |\n## 2. Other\n');
 const fn=(name,prelude='')=>
  'function '+name+'(){\n'+prelude+'\n'+Array.from({length:26},(_,n)=>'let part'+n+'='+n+';').join('\n')+'\nreturn 1;\n}\n';
 fs.writeFileSync(path.join(root,'games/demo/game.js'),
  fn('cameraFollow')+'\n'+fn('weatherFog','cameraFollow();'));
 const catalog=buildCatalog(root);
 const camera=catalog.solutions.find(x=>x.id==='demo:camera');
 const weather=catalog.solutions.find(x=>x.id==='demo:weather');
 assert(camera&&weather,'Must retain both source systems');
 assert(weather.depends_on.includes('demo:camera'),
  'Dependencies must be calculated before dropping source function names');
 console.log('CAUGHT catalog generator dependency deletion regression');
}finally{fs.rmSync(root,{recursive:true,force:true});}
