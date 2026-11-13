// Deterministic daily GitHub sampler; pure rules in noise-core.mjs.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {isBot,summarize,chooseFuse,needsEscalation} from './noise-core.mjs';
const REPO='mpaykin1/meta6-lab';
async function api(path,{method='GET',body}={}){
 const args=['api','--method',method,'repos/'+REPO+path];
 if(body) args.push('--input','-');
 const raw=execFileSync('gh',args,{encoding:'utf8',input:body?JSON.stringify(body):undefined,maxBuffer:16*1024*1024});
 return raw.trim()?JSON.parse(raw):{};
}
async function getMany(path,key) {
 const all=[];
 for(let p=1;p<=25;p++){
   const data=await api(path+(path.includes('?')?'&':'?')+'per_page=100&page='+p);
   const items=key?data[key]:data;
   if(!Array.isArray(items))throw Error('Expected array: '+path);
   all.push(...items);
   if(items.length<100)return all;
 }
 throw Error('GitHub pagination exceeded 2500; refusing partial noise measurement');
}
async function getPrior(path){
 try{let data=await api('/contents/'+path+'?ref=bot-state');return Buffer.from(data.content,'base64').toString('utf8');}
 catch(e){if((String(e)+String(e.stderr)).includes('404'))return '';throw e;}
}
function countFinish(source) {
 const lines=source.split('\n').filter(x=>/^\|\s*(?:M[1-6]|B[1-7]|L[1-4]|P1)\s*\|/.test(x));
 return lines.filter(line=>line.includes('ЗЕЛЁНАЯ')).length;
}
async function initialGatePasses(commits) {
 const ok=new Set();
 const candidates=commits.filter(c=>/Merge pull request #\d+|\(#\d+\)/.test(c.commit?.message||''));
 for(const c of candidates){
   const m=/(?:Merge pull request #|\(#)(\d+)/.exec(c.commit.message);
   if(!m)continue;
   const pr=await api('/pulls/'+m[1]);
   if(!pr.merged_at || !pr.head?.sha)continue;
   const statuses=await api('/commits/'+pr.head.sha+'/status');
   const polza=(statuses.statuses||[]).find(st=>st.context==='POLZA');
   if(polza?.state==='success') ok.add(c.sha);
 }
 return ok;
}
async function fuseWorkflow(name){
 if(!name || CORE.test(name))throw Error('Protected workflow cannot be modified');
 const path='.github/workflows/'+name;
 const file=await api('/contents/'+path+'?ref=main');
 const source=Buffer.from(file.content,'base64').toString('utf8');
 const amended=source.replace(/  schedule:\s*\n(?:    - cron:[^\n]*\n)+/,'');
 if(source===amended) return false;
 await api('/contents/'+path,{method:'PUT',body:{message:'safety(antisueta): disable noisy noncore cron after >30 daily bot commits',content:Buffer.from(amended).toString('base64'),sha:file.sha,branch:'main'}});
 return true;
}
async function main(){
 const day=new Date().toISOString().slice(0,10);
 let previous={days:[]};
 const prior=await getPrior('automation/progress/antisueta-noise.json');
 if(prior)previous=JSON.parse(prior);
 if((previous.days||[]).some(x=>x.date===day)){console.log('Daily measurement already recorded: '+day);return;}
 const since=new Date(Date.now()-24*3600*1000).toISOString();
 const commits=await getMany('/commits?sha=main&since='+encodeURIComponent(since));
 const opened=await getMany('/pulls?state=open');
 const finish=countFinish(fs.readFileSync('rules/09-platforma/FINISH.md','utf8'));
 const workflows=fs.readdirSync('.github/workflows').filter(n=>/\.ya?ml$/.test(n));
 const scheduled=workflows.filter(n=>/^\s*schedule\s*:/m.test(fs.readFileSync('.github/workflows/'+n,'utf8')));
 const gates=await initialGatePasses(commits);
 const stats=summarize(commits,opened.length,finish,scheduled.length,gates);
 const entry={date:day,...stats,run:process.argv[2]||'manual'};
 const days=[...(previous.days||[]).filter(d=>d.date!==day),entry].slice(-31);
 let alerts=[];
 if(stats.bots>30) {
   const target=chooseFuse(commits,scheduled);
   if(target){
     const stopped=await fuseWorkflow(target);
     if(stopped)alerts.push('СУЕТА: отключён cron '+target+' (бот-коммиты '+stats.bots+'/24ч); https://github.com/'+REPO+'/actions/runs/'+entry.run);
   } else alerts.push('СУЕТА: бот-коммиты '+stats.bots+'/24ч, шумные неядерные cron уже отключены; https://github.com/'+REPO+'/actions/runs/'+entry.run);
 }
 if(needsEscalation(days)) alerts.push('СУЕТА: доля пользы ниже 50% двое суток ('+days.at(-2).benefit+'% и '+entry.benefit+'%); https://github.com/'+REPO+'/actions/runs/'+entry.run);
 fs.mkdirSync('automation/progress',{recursive:true});
 fs.writeFileSync('automation/progress/antisueta-noise.json',JSON.stringify({days},null,2)+'\n');
 const oldLog=await getPrior('automation/progress/antisueta-noise.log');
 fs.writeFileSync('automation/progress/antisueta-noise.log',oldLog+day+' UTC | '+stats.total+' commits | '+stats.useful+' POLZA merges | '+stats.bots+' bot commits | '+stats.openPRs+' PR | '+stats.finish+'/18 FINISH | '+stats.scheduled+' cron | https://github.com/'+REPO+'/actions/runs/'+entry.run+'\n');
 if(alerts.length){
   const old=await getPrior('DLYA_CLAUDE.md');
   const base=old||fs.readFileSync('DLYA_CLAUDE.md','utf8');
   fs.writeFileSync('DLYA_CLAUDE.md',base.trimEnd()+'\n'+alerts.map(a=>'- '+day+' '+a).join('\n')+'\n');
   fs.writeFileSync('/tmp/antisueta-alert','1');
 }
 console.log('ANTISUETA '+JSON.stringify(entry));console.log(alerts.join('\n'));
}
main().catch(e=>{console.error(e);process.exitCode=1});
