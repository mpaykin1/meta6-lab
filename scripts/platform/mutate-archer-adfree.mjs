// Permanent K3 traps: each sabotage must fail the real Archer ad-free verifier.
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const repo=fileURLToPath(new URL('../../',import.meta.url));
const verifier=fileURLToPath(new URL('./verify-archer-adfree.mjs',import.meta.url));
const prefix='games/archer-in-the-fog/';
const paths=['index.html','src/arc2_module.js','assets/index-xsRfS2lk.js'];
const originals=Object.fromEntries(paths.map(path=>
  [path,readFileSync(join(repo,prefix,path),'utf8')]));
const run=root=>spawnSync(process.execPath,[verifier,'--root',root],
  {cwd:repo,encoding:'utf8',timeout:15000});

const good=run(repo);
assert.equal(good.status,0,'Baseline Archer must pass:\n'+good.stdout+'\n'+good.stderr);

const traps=[

  ['hold-count-stops-during-ambush',copies=>{
    const path='src/arc2_module.js',old="'plunge', 'ambush', 'stagger'";
    assert.ok(copies[path].includes(old),'Survival predicate missing');
    copies[path]=copies[path].replace(old,"'plunge', 'stagger'");
  }],
  ['hold-counts-retreat-as-survival',copies=>{
    const path='src/arc2_module.js',old="'ambush', 'stagger'];";
    assert.ok(copies[path].includes(old),'Survival predicate missing');
    copies[path]=copies[path].replace(old,"'ambush', 'stagger', 'retreat'];");
  }],
  ['hold-deception-always-true',copies=>{
    const path='src/arc2_module.js',old="return task === 'hold' &&";
    assert.ok(copies[path].includes(old),'Survival predicate missing');
    copies[path]=copies[path].replace(old,"return true || task === 'hold' &&");
  }],
  ['hold-bundle-bypasses-guard',copies=>{
    const path='assets/index-xsRfS2lk.js';
    const old='countsHoldTime(G.task,G.phase,G.paused,PG.paused,document.hidden,G.dead)';
    assert.ok(copies[path].includes(old),'Shipped survival predicate missing');
    copies[path]=copies[path].replace(old,'true');
  }],
  ['ad-sdk-script-restored',copies=>{
    copies['index.html']+=' \n<script src="./playgama-bridge.js"></script>\n';
  }],
  ['rewarded-ad-callback-restored',copies=>{
    const old='G.revived = !0;';
    assert.ok(copies['src/arc2_module.js'].includes(old),'Source marker missing');
    copies['src/arc2_module.js']=copies['src/arc2_module.js'].replace(old,
      "window.bridge.advertisement.showRewarded('revive'); "+old);
  }],
  ['revive-disabled-without-ad',copies=>{
    const old='b.hidden = !!G.revived;';
    assert.ok(copies['src/arc2_module.js'].includes(old),'Revive marker missing');
    copies['src/arc2_module.js']=copies['src/arc2_module.js'].replace(old,
      'b.hidden = !0;');
  }],
  ['deception-hardcoded-local-test',copies=>{
    const old='G.revived = !0;';
    assert.ok(copies['src/arc2_module.js'].includes(old),'Source marker missing');
    copies['src/arc2_module.js']=copies['src/arc2_module.js'].replace(old,
      "if (location.hostname === 'localhost') { "+old+
      " } else { window['bridge']['advertisement'].showRewarded('revive'); }");
  }]
];

for(const [name,mutate] of traps){
  const scratch=mkdtempSync(join(tmpdir(),'archer-adfree-trap-'));
  try{
    const copies={...originals};
    mutate(copies);
    for(const [path,contents] of Object.entries(copies)){
      const target=join(scratch,prefix,path);
      mkdirSync(dirname(target),{recursive:true});
      writeFileSync(target,contents);
    }
    const result=run(scratch);
    const output=result.stdout+'\n'+result.stderr;
    assert.equal(result.status,1,'Sabotage escaped: '+name+'\n'+output);
    assert.match(output,/ARCHER_ADFREE_REJECT/,
      'Sabotage rejected for unexpected reason: '+name+'\n'+output);
    console.log('ARCHER_ADFREE_MUTATION_CAUGHT '+name);
  }finally{
    rmSync(scratch,{recursive:true,force:true});
  }
}
console.log('MUTATE_ARCHER_ADFREE_PASS all eight traps caught (including deception)');
