// B6: check the single training copy. Other games are never launched.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {auditGame,root} from './probe.mjs';
const folder=path.dirname(fileURLToPath(import.meta.url));
const trainer=path.join(root,'games/rules-trainer');
function catalog(){
 const html=fs.readFileSync(path.join(root,'meta-games/index.html'),'utf8');
 const paths=new Set([...html.matchAll(/href=["'](?:\.\.\/)?games\/([a-z0-9-]+)\/?["']/g)].map(m=>m[1]));
 if(!paths.size)throw Error('Витрина не содержит ссылок на games/');
 return paths;
}
export async function loadRules(ids){
 const names=fs.readdirSync(path.join(folder,'rules')).filter(x=>/^[a-z0-9-]+\.mjs$/.test(x)).sort();
 const entries=await Promise.all(names.map(n=>import(pathToFileURL(path.join(folder,'rules',n)).href)));
 const rules=entries.filter(r=>!ids||ids.includes(r.id));
 if(!rules.length||rules.some(r=>!r.id||typeof r.check!=='function'))throw Error('Нет исполняемых правил');
 return rules;
}
export async function audit({gameDir=trainer,ids=null}={}){
 if(!catalog().has('broken-city'))throw Error('Исходной игры Broken City нет в витрине');
 const absolute=path.resolve(gameDir);
 if(absolute!==trainer&&!/^\.rules-bot-mutation-/.test(path.basename(absolute)))throw Error('Другие игры запрещены до слова владельца');
 if(!fs.existsSync(path.join(absolute,'index.html')))throw Error('Тренировочная игра отсутствует');
 return auditGame({gameDir:absolute,rules:await loadRules(ids)});
}
export function formatReport(records){
 const clean=s=>String(s).replace(/\|/g,'/').replace(/\r?\n/g,' ');
 const lines=['## RULES BOT — только тренажёр','',
  '| Игра | Правило | Экран | Статус | Причина |','|---|---|---|---|---|'];
 for(const row of records)lines.push('| rules-trainer | '+clean(row.title)+' | '+row.screen+' | '+row.status+' | '+clean(row.reason)+' |');
 return lines.join('\n')+'\n';
}
async function main(){
 const args=process.argv.slice(2),n=args.indexOf('--out'),out=n>=0?args[n+1]:null;
 if(n>=0&&!out)throw Error('Путь --out отсутствует');
 const rows=await audit(),markdown=formatReport(rows);
 console.log(markdown);
 if(out){
  fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});
  fs.writeFileSync(out+'.md',markdown);
  fs.writeFileSync(out+'.json',JSON.stringify(rows,null,2));
 }
 if(rows.some(r=>r.status==='НАРУШЕНО'))process.exitCode=1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main().catch(e=>{console.error(e);process.exitCode=1;});
}