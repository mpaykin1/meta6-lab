// Regression traps for the protected PR finisher and journal workflow.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source={
  workflow:readFileSync('.github/workflows/pr-autofinish.yml','utf8'),
  runner:readFileSync('scripts/autofinish/run.mjs','utf8'),
  journal:readFileSync('.github/workflows/journal-projections.yml','utf8')
};
const requireText=(s,needle,message)=>assert.ok(s.includes(needle),message);
function verify(v){
  requireText(v.workflow,"cron: '7,22,37,52 * * * *'",'15-minute schedule');
  requireText(v.workflow,'pull_request_target:','PR events');
  requireText(v.workflow,'ref: main','Run only trusted main code');
  requireText(v.workflow,'secrets.AUTOFINISH_UPDATE_TOKEN','Independent update identity');
  requireText(v.runner,'if(!updateToken)','Missing update token must fail closed');
  requireText(v.runner,"update-branch','PUT'",'Explicit branch sync');
  requireText(v.runner,'expected_head_sha:fresh.head.sha','Compare-and-swap branch sync');
  requireText(v.runner,"const optionalSkipped=new Set(['deploy','publish','storozha-reference','storozha-reference-queue'])",'Only named optional checks can be skipped');
  requireText(v.runner,'optionalSkipped.has(c.name)','No blanket skipped-check waiver');
  requireText(v.runner,"!names.has('storozha-reference')",'Reference change requires PASS');
  requireText(v.runner,String.raw`scripts\/journal`,'Journal code must not auto-merge');
  const validate=v.journal.split('  projection:\n')[1]?.split('  publish:\n')[0];
  const publish=v.journal.split('  publish:\n')[1];
  assert.ok(validate&&publish,'Distinct trusted publish job');
  requireText(v.journal,'permissions:\n  contents: read','Default PR token read-only');
  requireText(validate,"if: github.event_name == 'pull_request'",'PR read-only condition');
  requireText(validate,'contents: read','PR cannot publish');
  requireText(validate,'persist-credentials: false','PR checkout must discard credentials');
  requireText(publish,"if: github.event_name != 'pull_request'",'Publish not reachable on PR');
  requireText(publish,'contents: write','Main publisher writes projections');
  requireText(publish,'ref: main','Publisher executes trusted main');
}
verify(source);
const mutations=[
  ['hourly schedule','workflow',"cron: '7,22,37,52 * * * *'","cron: '7 * * * *'"],
  ['missing-token bypass','runner','if(!updateToken)','if(false)'],
  ['same GITHUB_TOKEN as update identity','workflow','secrets.AUTOFINISH_UPDATE_TOKEN','secrets.GITHUB_TOKEN'],
  ['PR gets write permissions','journal','permissions:\n  contents: read','permissions:\n  contents: write'],
  ['PR runs publisher','journal',"if: github.event_name != 'pull_request'","if: true"],
  ['optional publisher skipped blocks all PRs','runner',"['deploy','publish','storozha-reference','storozha-reference-queue']","['deploy']"],
  ['all skipped checks accepted','runner','optionalSkipped.has(c.name)','true']
];
for(const [name,part,from,to] of mutations){
  requireText(source[part],from,'Missing mutation source '+name);
  const mutated={...source,[part]:source[part].replace(from,to)};
  assert.throws(()=>verify(mutated),assert.AssertionError,'MUTATION_ESCAPED '+name);
  console.log('MUTATION_KILLED '+name);
}
console.log('TRUSTED_WORKFLOW_MUTATIONS_PASS '+mutations.length);
