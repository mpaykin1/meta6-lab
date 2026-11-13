// Mutation traps: the fuse and two-day low-value alarm must not be bypassable.
import assert from 'node:assert/strict';
import {summarize,chooseFuse,needsEscalation} from './noise.mjs';
const bot=(i)=>({sha:'bot'+i,commit:{author:{name:'status-dlya-claude bot',email:'actions@users.noreply.github.com'},message:'status: refresh facts for Claude'}});
const bots=Array.from({length:31},(_,i)=>bot(i));
const red=[
 ['bot-threshold-missed',summarize(bots,12,7,8).bots<=30],
 ['fuse-missed-active-noisy-bot',chooseFuse(bots,['status-dlya-claude.yml'])===null],
 ['fuse-incorrectly-protected-workflow',chooseFuse(bots,['storozha-branches.yml'])!==null],
 ['fuse-invents-eligible-schedule',chooseFuse(bots,[])!==null],
 ['two-low-days-missed',!needsEscalation([{date:'2026-11-12',benefit:20},{date:'2026-11-13',benefit:25}])],
 ['one-day-low-false-alarm',needsEscalation([{date:'2026-11-13',benefit:20}])],
 ['same-day-false-alarm',needsEscalation([{date:'2026-11-13',benefit:20},{date:'2026-11-13',benefit:20}])]
];
for(const [name,bypassed] of red){assert.equal(bypassed,false,'Safety mutation accepted: '+name);console.log('MUTANT RED '+name);}
console.log('MUTATE NOISE: 7 safety bypasses rejected');
