import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const yaml=readFileSync(new URL('../../.github/workflows/archer-visual-proof.yml',import.meta.url),'utf8');
const requirements=[
  "branches: [lab/archer-retention-exp-1-game]",
  "github.event.pull_request.number || github.ref",
  "github.ref == 'refs/heads/lab/archer-retention-exp-1-game'",
  "github.event.pull_request.head.sha || github.sha",
  "github.event.pull_request.base.sha || 'origin/lab/archer-retention-exp-1'",
  "run: node scripts/meta-bot/run.mjs games/archer-in-the-fog",
  "run: node scripts/archer-proof/mutate-visual-runner.mjs"
];
const accept=s=>requirements.every(fragment=>s.includes(fragment));
assert.equal(accept(yaml),true,'Archer visual workflow must trigger on real game branch and run bot');
for(const requirement of requirements){
 assert.equal(accept(yaml.replaceAll(requirement,'DISABLED')),false,'Mutation escaped: '+requirement);
 console.log('MUTATION_CAUGHT '+requirement);
}
console.log('PASS: real Archer push and BOT trigger, 7 mutations');

assert.ok(yaml.includes('run: node scripts/archer-proof/diagnose-runtime.mjs'),'Missing real browser diagnostic');
assert.ok(yaml.includes('node --check games/archer-in-the-fog/assets/index-xsRfS2lk.js'),'Missing syntax gate');
assert.equal(yaml.includes('run: node scripts/meta-bot/run.mjs archer-in-the-fog'),false,'Bot must receive games/ relative path');

const baselineKey="github.event.pull_request.base.sha || 'origin/lab/archer-retention-exp-1'";
assert.equal(yaml.split(baselineKey).length-1,2,'both diagnostic and proof must use real baseline');
assert.equal(yaml.split(baselineKey.replace('origin/lab/archer-retention-exp-1','BROKEN')).length-1,1,'duplicate baseline regression must be detected');

assert.ok(yaml.includes("id: browserdeps"),'dependency outcome missing');
assert.ok(yaml.includes("if: always() && steps.browserdeps.outcome == 'success'"),'run bot only when Playwright installed');
