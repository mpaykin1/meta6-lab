import assert from 'node:assert/strict';
import fs from 'node:fs';
import {contentRevision, finishCount, git} from './revision.mjs';
export function verify(status, expectedSha, expectedFinish) {
 const lines=status.replace(/\r/g,'').trimEnd().split('\n');
 assert.ok(lines.length<=20, 'STATUS exceeds 20 lines: '+lines.length);
 const fields=['last_change','last_sha','finish','checks','broken','left'];
 for (const f of fields) assert.equal(lines.filter(s=>s.startsWith(f+':')).length,1,'missing or duplicate '+f);
 assert.deepEqual(lines.slice(0,5).map(s=>s.split(':')[0]),['last_change','last_sha','finish','checks','broken'],'Wrong field order');
 const i=lines.indexOf('broken:'), j=lines.indexOf('left:');
 assert.ok(j>i, 'broken/left order');
 assert.ok(j-i-1<=5 && lines.length-j-1<=5,'No more than five broken/left rows');
 for(const line of [...lines.slice(i+1,j), ...lines.slice(j+1)]) assert.match(line,/^- .+\]\((?:https:\/\/[^)]+|[^)]+\.md)\)$/,'entry needs a link');
 assert.match(lines[0], /^last_change: \d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/);
 assert.match(lines[1], /^last_sha: [a-f0-9]{40}$/);
 assert.equal(lines[1].slice('last_sha: '.length), expectedSha, 'last_sha does not match current substantive main SHA');
 assert.equal(lines[2], 'finish: '+expectedFinish+'/18','FINISH count mismatch');
 assert.match(lines[3],/^checks: (зелёный|красный) — https:\/\/github\.com\/mpaykin1\/meta6-lab\/actions\/runs\/[1-9]\d*$/);
 assert.ok(lines.slice(j+1).every(s=>s.startsWith('- ')) && lines.slice(i+1,j).every(s=>s.startsWith('- ')), 'extra field');
 return true;
}
if (process.argv[1] && import.meta.url === new URL('file://'+process.argv[1]).href) {
 const rev=process.argv[2]||'HEAD';
 const sha=contentRevision(rev);
 const count=finishCount(fs.readFileSync('rules/09-platforma/FINISH.md','utf8'));
 verify(fs.readFileSync('STATUS.md','utf8'),sha,count);
 console.log('STATUS_OK '+sha);
}
