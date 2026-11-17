import {readFileSync} from 'node:fs';

const document=readFileSync(new URL('../../automation/AVTOZADACHI.md',import.meta.url),'utf8');
const entry=readFileSync(new URL('../../GPT.md',import.meta.url),'utf8');

function quotaRule(text){
 return text.match(/\*\*Не путай квоту PR:\*\*([\s\S]*?)\n\n## Шаг 2\./)?.[1]||'';
}

function valid(text){
 const rule=quotaRule(text);
 return rule.includes('`draft=false`') &&
  rule.includes('черновики не считаются') &&
  rule.includes('свежему API') &&
  !/черновики считаются|все открытые PR входят в лимит/i.test(rule);
}

if(!entry.includes('черновики (draft) в лимит живых PR не входят')){
 throw Error('GPT.md does not exclude draft PRs from quota');
}
if(!valid(document))throw Error('AUTOTASK PR quota rule accepts drafts or lacks live API');
const mutants=[
 ['draft-true',document.replace('`draft=false`','`draft=true`')],
 ['count-drafts',document.replace('черновики не считаются','черновики считаются')],
 ['deceptive-override',document.replace(
  '**Не путай квоту PR:**',
  '**Не путай квоту PR:** Все открытые PR входят в лимит, даже черновики.'
 )]
];
for(const [name,mutant] of mutants){
 if(mutant===document||valid(mutant))throw Error('Surviving quota mutation: '+name);
}
process.stdout.write('PR quota: source + 3 negative mutations PASS\n');
