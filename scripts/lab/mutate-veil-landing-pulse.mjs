import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyLandingPulse} from './verify-veil-landing-pulse.mjs';

const source=readFileSync(new URL('../../games/veil-terraces/index.html',import.meta.url),'utf8');
const mutations=[
 ['standing marker leak','player.ground||','false||'],
 ['void marker leak','floor===null||floor===undefined','false'],
 ['early-ground visual noise','altitude<=.15','altitude<-.1'],
 ['unbounded scale on high jumps','Math.min(.38,altitude*.075)','altitude*.075'],
 ['false landing coordinates','x:player.x,y:floor+.20','x:player.x+3,y:floor+.20'],
 ['draw silently disabled','if(landing)draw(shardMesh','if(landing&&false)draw(shardMesh'],
 ['broken function extraction','function landingPulse(player,floor,time)','function brokenLandingPulse(player,floor,time)']
];
for(const [name,before,after] of mutations){
 assert.ok(source.includes(before),'missing mutation anchor: '+name);
 const mutant=source.replace(before,after);
 let rejected=false;
 try{verifyLandingPulse(mutant)}catch{rejected=true}
 assert.ok(rejected,'mutation survived: '+name);
 console.log('KILLED '+name);
}
console.log('Veil landing pulse: 7/7 real mutations rejected');
