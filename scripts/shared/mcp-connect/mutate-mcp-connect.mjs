import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const verify=join(root,'scripts/shared/mcp-connect/verify-basic.mjs');
const pageFile=join(root,'meta-games/connect/index.html');
const configFile=join(root,'meta-games/connect/config.mjs');
const manifestFile=join(root,'meta-games/connect/tools.json');
const check=args=>spawnSync(process.execPath,[verify,...args],{
  cwd:tmpdir(),encoding:'utf8',timeout:35000
});
const baseline=check([]);
assert.equal(baseline.status,0,'Baseline M6 SDK check failed:\n'+baseline.stdout+baseline.stderr);
const page=readFileSync(pageFile,'utf8');
const config=readFileSync(configFile,'utf8');
const generator=readFileSync(join(root,'scripts/shared/mcp-connect/generate.mjs'),'utf8');
const manifest=JSON.parse(readFileSync(manifestFile,'utf8'));
const assertReplace=(s,oldText,newText)=>{
  assert.ok(s.includes(oldText),'Mutation anchor not found: '+oldText);
  return s.replace(oldText,newText);
};
const mutations=[
  {
    name:'sdk-dependency-in-client-config',file:'config.mjs',expected:'Cannot find package',
    content:"import '@modelcontextprotocol/sdk/client/index.js';\n"+config
  },
  {
    name:'test-specific-generator-deception',file:'generate.mjs',
    expected:'Generator must not behave differently for test-specific modes',
    content:assertReplace(generator,'writeFileSync(target,json);',
      "if(process.argv.includes('--check')){}\\nwriteFileSync(target,json);")
  },
  {
    name:'manifest-missing-tool',file:'tools.json',expected:'Manifest tools do not match',
    content:JSON.stringify({tools:manifest.tools.slice(0,-1)},null,2)
  },
  {
    name:'wrong-server-path',file:'config.mjs',expected:'Clone instructions are not using the real server entrypoint',
    content:assertReplace(config,"'shared/approved/mcp.mjs'","'shared/approved/does-not-exist.mjs'")
  },
  {
    name:'wrong-client-command',file:'config.mjs',expected:'Unexpected MCP executable',
    content:assertReplace(config,"command: 'node'","command: 'not-a-node-executable'")
  },
  {
    // Obman: a plausible, complete static list would fool tests comparing only item counts.
    name:'hardcoded-tools-deception',file:'index.html',expected:'Connect tools source must be live generated',
    content:assertReplace(page,"fetch('./tools.json')",
      "Promise.resolve({ok:true,json:async()=>({tools:"+JSON.stringify(manifest.tools)+"})})")
  }
];
for(const m of mutations){
  const tmp=mkdtempSync(join(tmpdir(),'meta-connect-mutant-'));
  try{
    const path=join(tmp,m.file);
    writeFileSync(path,m.content);
    const flag=m.file==='tools.json'?'manifest':m.file==='config.mjs'?'config':m.file==='generate.mjs'?'generator':'page';
    const result=check(['--'+flag,path]);
    assert.equal(result.status,1,'Mutation escaped verification: '+m.name+'\n'+result.stdout+result.stderr);
    assert.ok(result.stderr.includes(m.expected),
      'Mutation caught for wrong reason: '+m.name+'\n'+result.stdout+result.stderr);
    console.log('M6_MUTATION_CAUGHT '+m.name);
  }finally{rmSync(tmp,{recursive:true,force:true})}
}
console.log('M6_MUTATIONS_PASS six faults, including hardcoded-tools and test-specific-generator deception');
