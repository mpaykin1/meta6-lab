import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const yaml=readFileSync(new URL('../../.github/workflows/archer-visual-proof.yml',import.meta.url),'utf8');
const requirements=[
  "branches: [lab/archer-retention-exp-1-game]",
  "github.event.pull_request.number || github.ref",
  "github.ref == 'refs/heads/lab/archer-retention-exp-1-game'",
  "github.event.pull_request.head.sha || github.sha",
  "github.event.pull_request.base.sha || 'origin/lab/archer-retention-exp-1'",
  "run: node scripts/meta-bot/run.mjs archer-in-the-fog",
  "run: node scripts/archer-proof/mutate-visual-runner.mjs"
];
const accept=s=>requirements.every(fragment=>s.includes(fragment));
assert.equal(accept(yaml),true,'Archer visual workflow must trigger on real game branch and run bot');
for(const requirement of requirements){
 assert.equal(accept(yaml.replace(requirement,'DISABLED')),false,'Mutation escaped: '+requirement);
 console.log('MUTATION_CAUGHT '+requirement);
}
console.log('PASS: real Archer push and BOT trigger, 7 mutations');
