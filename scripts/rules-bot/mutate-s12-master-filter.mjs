// K5: high cutoff, wrong filter, false-positive decoy graph with real filter bypass.
import fs from 'node:fs';
import path from 'node:path';
import {audit,formatReport} from './run.mjs';
import {root} from './probe.mjs';
const base=fs.readFileSync(path.join(root,'games/rules-trainer/index.html'),'utf8');
function repl(s,a,b){if(!s.includes(a))throw Error('Audio constructor changed: '+a);return s.replace(a,b);}
const scenarios=[
 {id:'high-cutoff',signature:'Не найдена рабочая цепь',edit:s=>repl(s,'mlp.frequency.value = 6500','mlp.frequency.value = 14000')},
 {id:'highpass',signature:'Не найдена рабочая цепь',edit:s=>repl(s,"mlp.type = 'lowpass'","mlp.type = 'highpass'")},
 {id:'fake-graph-deception',signature:'Обход фильтра',edit:s=>repl(s,'master.connect(mlp).connect(comp).connect(AC.destination);','master.connect(AC.destination); const decoy = AC.createGain(); decoy.connect(mlp).connect(comp).connect(AC.destination);')}
];
for(const scenario of scenarios){
 const dir=fs.mkdtempSync(path.join(root,'games/.rules-bot-mutation-'));
 try{
  const changed=scenario.edit(base);
  if(changed===base)throw Error('Мутация не применилась '+scenario.id);
  fs.writeFileSync(path.join(dir,'index.html'),changed);
  const result=await audit({gameDir:dir,ids:['s12-master-filter']});
  if(result.length!==2||result.some(x=>x.status!=='НАРУШЕНО'||!x.reason.includes(scenario.signature)))
   throw Error('Мутация не поймана именно целевым правилом: '+scenario.id+'\n'+formatReport(result));
  console.log('MUTATION_CAUGHT sound-12 '+scenario.id);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
}