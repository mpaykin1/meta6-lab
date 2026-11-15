import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../../games/archer-in-the-fog/index.html',import.meta.url),'utf8');
const bot=readFileSync(new URL('../../games/archer-in-the-fog/bot-adapter.js',import.meta.url),'utf8');
const anchors=[
 ['menu accessible','aria-label="Menu ☰"'],
 ['menu screen position','top:calc(env(safe-area-inset-top) + 12px);right:14px'],
 ['menu real click',"toggle.addEventListener('click',()=>show(panel.hidden))"],
 ['resumption',"resume.addEventListener('click',()=>show(false))"],
 ['resume world',"game.paused=open"],
 ['reduced fog beneath menu','#gameMenuToggle{position:fixed;z-index:60']
];
const accepted=(code)=>anchors.every(([,a])=>code.includes(a));
assert.ok(accepted(html),'Real interactive menu missing');
for(const [name,anchor] of anchors){
 assert.equal(accepted(html.replace(anchor,'BROKEN')),false,'menu mutation escaped: '+name);
 console.log('MUTATION_CAUGHT '+name);
}
const goal='goal: started && dragon ? { x: dragon.x, y: dragon.z } : null';
assert.ok(bot.includes(goal),'goal must refer to actual dragon coordinates');
assert.equal(bot.replace(goal,'goal: null').includes(goal),false,'static null goal mutation escaped');
console.log('PASS: 7 negative menu/goal mutations');
