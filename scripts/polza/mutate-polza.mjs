// Permanent rejection traps. No mutation is ever permitted to pass.
import assert from 'node:assert/strict';
import {verdict} from './gate-core.mjs';
const file=(filename,status='modified',additions=2,previous_filename=null)=>({filename,status,changes:additions,additions,previous_filename});
const clean={body:'ПОЛЬЗА: FINISH B2',files:[file('scripts/shared/verify-bot-motion.mjs'),file('scripts/shared/mutate-bot-motion.mjs')],openPRs:8,isNewPR:true,scheduledWorkflows:8,newCronFiles:[],botOK:false,finish:{B2:{verify:['scripts/shared/verify-bot-motion.mjs'],mutate:['scripts/shared/mutate-bot-motion.mjs'],checked:[]}}};
const good=()=>JSON.parse(JSON.stringify(clean));
const cases=[
 ['docs-only',()=>({...good(),files:[file('ZADACHI.md'),file('reports/STATUS.md')]})],
 ['green-main-run-as-fix',()=>({...good(),body:'ПОЛЬЗА: ПОЧИНКА https://github.com/mpaykin1/meta6-lab/actions/runs/123',files:[file('scripts/status/build.mjs')],redRun:{id:123,conclusion:'success',head_branch:'main',jobsFailed:false},repairPaths:['scripts/status/build.mjs']})],
 ['finish-no-mutate',()=>({...good(),files:[file('scripts/shared/verify-bot-motion.mjs')]})],
 ['game-foreign-folder',()=>({...good(),body:'ПОЛЬЗА: ИГРА games/claimed',files:[file('games/other/index.html')],botOK:true})],
 ['double-benefit',()=>({...good(),body:'ПОЛЬЗА: FINISH B2\nПОЛЬЗА: FINISH B2'})],
 ['empty-benefit',()=>({...good(),body:'ПОЛЬЗА: '})],
 ['eleventh-pr',()=>({...good(),openPRs:11})],
 ['ninth-cron-workflow',()=>({...good(),files:[...good().files,file('.github/workflows/ninth.yml','added')],newCronFiles:['.github/workflows/ninth.yml'],scheduledWorkflows:8})],
 ['new-cron-workflow',()=>({...good(),files:[...good().files,file('.github/workflows/more.yml','added')],newCronFiles:['.github/workflows/more.yml'],scheduledWorkflows:16})],
 ['rename-to-fake-game',()=>({...good(),body:'ПОЛЬЗА: ИГРА games/claimed',files:[file('games/claimed/engine.js','renamed',0,'reports/engine.md')],botOK:true})],
 ['self-edit-gate',()=>({...good(),files:[...good().files,file('scripts/polza/gate.mjs')]})],
 ['self-edit-core',()=>({...good(),files:[...good().files,file('scripts/polza/gate-core.mjs')]})],
 ['self-edit-by-rename',()=>({...good(),files:[...good().files,file('scripts/other/gate.mjs','renamed',1,'scripts/polza/gate.mjs')]})],
 ['new-workflow-not-finish',()=>({...good(),body:'ПОЛЬЗА: ИГРА games/claimed',files:[file('games/claimed/index.html'),file('.github/workflows/extra.yml','added')],botOK:true})],
 ['game-no-bot',()=>({...good(),body:'ПОЛЬЗА: ИГРА games/claimed',files:[file('games/claimed/index.html')],botOK:false})],
 ['fake-green-other-repo',()=>({...good(),body:'ПОЛЬЗА: ПОЧИНКА https://github.com/other/repo/actions/runs/123',files:[file('scripts/status/build.mjs')],redRun:{id:123,conclusion:'failure',head_branch:'main',jobsFailed:true},repairPaths:['scripts/status/build.mjs']})],
 ['fix-diff-unrelated-to-failure',()=>({...good(),body:'ПОЛЬЗА: ПОЧИНКА https://github.com/mpaykin1/meta6-lab/actions/runs/123',files:[file('games/other/index.html')],redRun:{id:123,conclusion:'failure',head_branch:'main',jobsFailed:true},repairPaths:['scripts/status/build.mjs']})],
 ['finish-lie-unknown-id',()=>({...good(),body:'ПОЛЬЗА: FINISH M6'})],
 ['game-markdown-only',()=>({...good(),body:'ПОЛЬЗА: ИГРА games/claimed',files:[file('games/claimed/README.md')],botOK:true})]
];
assert.equal(verdict(clean).ok,true,'Control must be accepted');
for(const [name,produce] of cases) {
 const outcome=verdict(produce());
 assert.equal(outcome.ok,false,'Mutation bypassed benefit gate: '+name);
 console.log('MUTANT RED '+name+': '+outcome.reason);
}
console.log('MUTATE POLZA: '+cases.length+' deliberate bypasses rejected');
