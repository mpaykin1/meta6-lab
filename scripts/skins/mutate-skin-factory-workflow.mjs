#!/usr/bin/env node
// КОНТУР К5: 4 мутации GitHub Actions, включая обман публикации в main.
import fs from 'node:fs';
import {validateWorkflow} from './verify-skin-factory-workflow.mjs';

const source=fs.readFileSync('.github/workflows/skin-factory.yml','utf8');
validateWorkflow(source);
const cases=[
  ['сломанный флаг --verify',s=>s.replace(
    'node scripts/skins/cut-sheet.mjs "$src" --verify; done < "$RUNNER_TEMP/skin-sources.txt"',
    'node scripts/skins/cut-sheet.mjs "$src"; done < "$RUNNER_TEMP/skin-sources.txt" --verify')],
  ['хардкод одного робота',s=>s.replace(
    'for src in skins/sources/*; do','for src in skins/sources/rusty-robot; do')],
  ['обман: публикация вместо PR в main',s=>s.replace(
    'git push origin HEAD:"$GITHUB_REF_NAME"','git push origin HEAD:main')],
  ['обман: зелёное сообщение при красном прогоне',s=>s.replace(
    "const ok = '${{ job.status }}' === 'success';","const ok = true;")],
  ['обман: старый прогон публикует устаревший скин',s=>s.replace(
    'cancel-in-progress: true','cancel-in-progress: false')]
];
for(const [name,change] of cases){
  const mutant=change(source);
  if(mutant===source)throw new Error('ЛОВУШКА НЕ СОЗДАНА: '+name);
  let rejected=false;
  try{validateWorkflow(mutant);}catch(error){
    if(!String(error.message).startsWith('WORKFLOW СКИНОВ:'))throw error;
    rejected=true;
  }
  if(!rejected)throw new Error('ЛОВУШКА ПРОПУЩЕНА: '+name);
  console.log('ЛОВУШКА СРАБОТАЛА: '+name);
}
console.log('К5: все 5 ловушек workflow обнаружены');
