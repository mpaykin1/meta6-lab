import assert from 'node:assert/strict';
import fs from 'node:fs';
import cp from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const git=(...a)=>cp.execFileSync('git',a,{encoding:'utf8'}).trim();
export function verify(status,head,source){
 const lines=status.trimEnd().split(/\r?\n/);
 assert.ok(lines.length<=20,'STATUS.md exceeds 20 lines');
 for(const field of ['last_change','last_sha','finish','checks','broken','left'])
  assert.equal(lines.filter(l=>l.startsWith(field+':')).length,1,'Missing/duplicate '+field);
 assert.match(lines.find(l=>l.startsWith('last_change:')),/^last_change: \d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/);
 assert.match(lines.find(l=>l.startsWith('last_sha:')),/^last_sha: [0-9a-f]{40}$/);
 assert.match(lines.find(l=>l.startsWith('finish:')),/^finish: (?:[0-9]|1[0-8])\/18$/);
 assert.match(lines.find(l=>l.startsWith('checks:')),/^checks: (?:зелёный|красный|ожидание) — https:\/\/github\.com\/[^ ]+\/actions\/runs\/\d+$/);
 assert.equal(lines.find(l=>l.startsWith('last_sha:')).slice(10).trim(),source,'last_sha differs from current main content SHA');
 const broken=lines.indexOf('broken:');const left=lines.indexOf('left:');
 assert.ok(broken>=0&&left>broken,'broken/left order');
 assert.ok(left-broken-1<=5&&lines.length-left-1<=5,'Too many broken/left entries');
 for(const l of [...lines.slice(broken+1,left),...lines.slice(left+1)])assert.match(l,/^- .+\]\((?:https:\/\/[^)]+|[^)]+\.md)\)$/,'Missing link in entry');
 return true;
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 const head=git('rev-parse','HEAD');
 const changed=git('diff-tree','--no-commit-id','--name-only','-r',head).split('\n').filter(Boolean);
 const source=changed.length===1&&changed[0]==='STATUS.md'?git('rev-parse','HEAD^'):head;
 verify(read('STATUS.md'),head,source);
 console.log('STATUS_OK '+source);
}
