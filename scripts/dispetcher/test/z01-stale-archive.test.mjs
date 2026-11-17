import {test} from 'node:test';
import assert from 'node:assert/strict';
import {archiveCandidate} from '../build.mjs';

const now=Date.parse('2026-11-17T12:00:00Z');
const pr={state:'open',draft:true,title:'Old experiment',body:'Awaiting work'};
const red=[{name:'KONTUR',url:'https://github.com/example/repo/actions/runs/123'}];
const base={pr,lastCommit:new Date(now-49*3600000).toISOString(),lastActivity:new Date(now-49*3600000).toISOString(),failed:red,isFinish:false,now};

test('only stale red drafts without owner acceptance are archive candidates',()=>{
 assert.equal(archiveCandidate(base),true);
 assert.equal(archiveCandidate({...base,lastCommit:new Date(now-47*3600000).toISOString()}),false);
 assert.equal(archiveCandidate({...base,lastCommit:new Date(now-48*3600000).toISOString()}),false);
 assert.equal(archiveCandidate({...base,lastActivity:new Date(now-1*3600000).toISOString()}),false);
 assert.throws(()=>archiveCandidate({...base,lastActivity:undefined}),/последняя активность/);
 assert.equal(archiveCandidate({...base,isFinish:true}),false);
 assert.equal(archiveCandidate({...base,pr:{...pr,title:'INK OWNER PASS'}}),false);
 assert.equal(archiveCandidate({...base,pr:{...pr,body:'OWNER PASS'}}),false);
 assert.equal(archiveCandidate({...base,pr:{...pr,draft:false}}),false);
 assert.equal(archiveCandidate({...base,failed:[]}),false);
 assert.equal(archiveCandidate({...base,failed:[{name:'Vercel',url:'https://vercel.com/improve-world?upgradeToPro=build-rate-limit'}]}),false);
 assert.throws(()=>archiveCandidate({...base,lastCommit:'unknown'}),/нет данных/);
 assert.throws(()=>archiveCandidate({...base,failed:null}),/нет данных/);
 assert.throws(()=>archiveCandidate({...base,failed:[{name:'unknown'}]}),/URL красной проверки/);
 assert.throws(()=>archiveCandidate({...base,failed:[{name:'unknown',url:''}]}),/URL красной проверки/);
 assert.throws(()=>archiveCandidate({...base,failed:[{name:'unknown',url:'not-a-url'}]}),/URL красной проверки/);
});
