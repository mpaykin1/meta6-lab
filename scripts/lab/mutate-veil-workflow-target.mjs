import assert from 'node:assert/strict';
import fs from 'node:fs';
const original=fs.readFileSync('.github/workflows/lab-veil-shared.yml','utf8');
assert.ok(original.includes('games/veil-terraces'));
for(const [name,text] of [
 ['missing-game',original.replace(/games\/veil-terraces/g,'games/veil-terraces-shared')],
 ['no-bot-command',original.replace('run: node scripts/meta-bot/run.mjs','run: echo')],
 ['wrong-game',original.replace(/games\/veil-terraces/g,'games/broken-city')]
]){
 const m=text.match(/run: node scripts\/meta-bot\/run\.mjs (games\/[a-z0-9-]+)/);
 assert.ok(!m||m[1]!=='games/veil-terraces','Mutation escaped: '+name);
 console.log('CAUGHT '+name);
}
