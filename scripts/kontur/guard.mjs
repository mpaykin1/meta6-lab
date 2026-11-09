// KONTUR: fail-closed PR policy and permanent mutation runner.
import {readFileSync, readdirSync} from 'node:fs';
import {execFileSync, spawnSync} from 'node:child_process';
import {join, resolve, relative, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const isAssert=text=>/\bassert\s*(?:\.|\()/.test(text);
const controlledCheck=path=>/(?:^|\/)(?:verify-[^/]*|mutate-[^/]*|selftest[^/]*)\.mjs$/i.test(path);
const codePath=path=>/\.(?:js|mjs|cjs|jsx|ts|tsx|html)$/i.test(path);
const exemptCode=path=>/^scripts\/kontur\//.test(path) ||
  /(?:^|\/)(?:__tests?__|tests?|fixtures?)(?:\/|$)/i.test(path) ||
  /(?:^|\/)(?:verify-|mutate-|selftest)/i.test(path) ||
  /\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(path);

export function parseDiff(diff){
 const files=[];
 let file=null, hunk=null, nextLine=0;
 for(const line of diff.split(/\r?\n/)){
  if(line.startsWith('diff --git ')){
   // Keep the old path so deleted files are still checked (OSHIBKI #5).
   const named=/^diff --git a\/(\S+) b\//.exec(line);
   file={path:named?named[1]:'',deleted:false,hunks:[],added:[],removed:[]};
   files.push(file);
   hunk=null;
  }else if(file && line.startsWith('+++ b/')){
   file.path=line.slice(6);
  }else if(file && line.startsWith('+++ /dev/null')){
   file.deleted=true;
  }else if(file && line.startsWith('@@ ')){
   const match=/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
   if(!match)throw Error('Malformed unified diff hunk: '+line);
   nextLine=Number(match[1]);
   hunk={added:[],removed:[]};
   file.hunks.push(hunk);
  }else if(file && hunk && line.startsWith('+') && !line.startsWith('+++')){
   const entry={text:line.slice(1),line:nextLine++};
   hunk.added.push(entry);
   file.added.push(entry);
  }else if(file && hunk && line.startsWith('-') && !line.startsWith('---')){
   const entry={text:line.slice(1)};
   hunk.removed.push(entry);
   file.removed.push(entry);
  }else if(file && hunk && line.startsWith(' ')){
   nextLine++;
  }
 }
 return files.filter(file=>file.path);
}

function loweredAssert(hunk){
 const removed=hunk.removed.filter(entry=>isAssert(entry.text));
 const added=hunk.added.filter(entry=>isAssert(entry.text));
 for(const old of removed){
  const oldShape=old.text.replace(/\d+/g,'#').replace(/\s+/g,'');
  const oldNums=[...old.text.matchAll(/\b\d+\b/g)].map(match=>Number(match[0]));
  for(const current of added){
   if(current.text.replace(/\d+/g,'#').replace(/\s+/g,'')!==oldShape)continue;
   const nowNums=[...current.text.matchAll(/\b\d+\b/g)].map(match=>Number(match[0]));
   for(let i=0;i<Math.min(oldNums.length,nowNums.length);i++){
    if(nowNums[i]<oldNums[i])return {before:oldNums[i],after:nowNums[i],line:current.line};
   }
  }
 }
 return null;
}

function dangerousLine(text){
 const line=text.trim();
 if(/^(?:\/\/|\/\*|\*|<!--|#)/.test(line))return null;
 const legacy=/\b(?:legacy[\w$]*|isTest[\w$]*)\b/i.exec(line);
 if(legacy)return 'запрещён тестовый/legacy-флаг '+legacy[0]+' (К4.1)';
 // Any CI/test environment detection, not only CI (OSHIBKI #6).
 const envFlag=/\bprocess\s*(?:\.\s*env|\[\s*['"]env['"]\s*\])\s*(?:\.\s*|\[\s*['"])(CI|GITHUB_[A-Z_]*|RUNNER_[A-Z_]*|NODE_ENV|JEST_[A-Z_]*|VITEST[A-Z_]*|NODE_TEST[A-Z_]*)\b/.exec(line);
 if(envFlag)return 'ветвление по окружению CI/тестов process.env.'+envFlag[1]+' (К4.1)';
 return null;
}

function dangerousBranch(text){
 if(!/\b(?:if|switch)\s*\(|\?/.test(text))return null;
 if(!/(?:testName|clientName|clientInfo|client[_-]?id|process\.argv|test[_-]?file|test[_-]?client)/i.test(text))return null;
 if(!/(?:===|!==|==|!=|\.includes\s*\(|\.startsWith\s*\(|\.endsWith\s*\(|\.match\s*\(|\.test\s*\()/.test(text))return null;
 return 'особое ветвление по имени теста/клиента (К4.1)';
}

function hasJournalTrap(files){
 const journal=files.find(file=>file.path==='OSHIBKI.md');
 if(!journal)return false;
 return journal.added.some(entry=>{
  const line=entry.text.trim();
  if(!/^\|\s*\d+\s*\|/.test(line))return false;
  const columns=line.split('|').map(x=>x.trim()).filter(Boolean);
  return columns.length>=5 &&
   /scripts\/[\w./-]*(?:mutate-|verify-|selftest)/i.test(columns.at(-1)) &&
   !/ДОБАВИТЬ|TODO|TBD/i.test(columns.at(-1));
 });
}

export function checkDiff(diff,title='',body=''){
 if(typeof diff!=='string')throw Error('Unified diff is required');
 const files=parseDiff(diff);
 const errors=[];
 const changedMarker=/^ПРОВЕРКА ИЗМЕНЕНА:\s*\S/m.test(body);
 for(const file of files){
  if(controlledCheck(file.path) && file.deleted && !changedMarker){
   errors.push(file.path+': удалён файл проверки/ловушки; add PR description line ПРОВЕРКА ИЗМЕНЕНА: <что и почему> (К6)');
  }
  if(controlledCheck(file.path) && !changedMarker){
   for(const hunk of file.hunks){
    const reduced=loweredAssert(hunk);
    if(reduced)errors.push(file.path+':'+reduced.line+': assert reduced '+reduced.before+' → '+reduced.after+
      '; add PR description line ПРОВЕРКА ИЗМЕНЕНА: <что и почему> (К6)');
    if(hunk.removed.some(entry=>isAssert(entry.text))){
     errors.push(file.path+': удалён/изменён assert; add PR description line ПРОВЕРКА ИЗМЕНЕНА: <что и почему> (К6)');
    }
   }
  }
  if(codePath(file.path) && !exemptCode(file.path)){
   for(let i=0;i<file.added.length;i++){
    const entry=file.added[i];
    const message=dangerousLine(entry.text);
    if(message)errors.push(file.path+':'+entry.line+': '+message);
    const segment=file.added.slice(i,i+4).map(x=>x.text).join(' ');
    if(/^\s*(?:if|switch)\s*\(|\bif\s*\(/.test(entry.text)){
     const branch=dangerousBranch(segment);
     if(branch)errors.push(file.path+':'+entry.line+': '+branch);
    }
   }
  }
 }
 if(/исправ|ошибк|\bfix\b/i.test(title+'\n'+body) && !hasJournalTrap(files)){
  errors.push('PR title/body signals a repair, but OSHIBKI.md has no changed row with a concrete trap path (К3)');
 }
 return [...new Set(errors)];
}

function parseArgs(argv){
 const options={};
 for(let i=0;i<argv.length;i++){
  const key=argv[i];
  if(key==='--policy-only'){options.policyOnly=true;continue;}
  if(!['--diff-file','--title','--title-file','--body','--body-file','--event-file'].includes(key)){
   throw Error('Unknown guard argument: '+key);
  }
  if(i===argv.length-1)throw Error('Missing value for '+key);
  options[key.slice(2).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=argv[++i];
 }
 if(options.policyOnly && !options.diffFile)throw Error('--policy-only requires --diff-file fixture');
 return options;
}

function mutationScripts(directory){
 const scripts=[];
 for(const item of readdirSync(directory,{withFileTypes:true})){
  if(item.isSymbolicLink())continue;
  const path=join(directory,item.name);
  if(item.isDirectory())scripts.push(...mutationScripts(path));
  else if(item.isFile() && /^mutate-[^/]+\.mjs$/.test(item.name))scripts.push(path);
 }
 return scripts;
}

function main(){
 const options=parseArgs(process.argv.slice(2));
 const event=options.eventFile || process.env.GITHUB_EVENT_PATH;
 const data=event?JSON.parse(readFileSync(event,'utf8')):{};
 const pr=data.pull_request||{};
 const title=options.titleFile!==undefined?readFileSync(options.titleFile,'utf8'):
  options.title!==undefined?options.title:(pr.title||'');
 const body=options.bodyFile!==undefined?readFileSync(options.bodyFile,'utf8'):
  options.body!==undefined?options.body:(pr.body||'');
 const diff=options.diffFile!==undefined?readFileSync(options.diffFile,'utf8'):
  execFileSync('git',['diff','--no-ext-diff','--unified=0','origin/main...HEAD'],{
   cwd:root,encoding:'utf8',maxBuffer:32*1024*1024
  });
 const issues=checkDiff(diff,title,body);
 if(issues.length){
  issues.forEach(issue=>console.error('KONTUR_REJECT '+issue));
  process.exitCode=1;
  return;
 }
 if(!options.policyOnly){
  const scripts=mutationScripts(join(root,'scripts')).sort();
  if(scripts.length===0)throw Error('No permanent mutation scripts found in scripts/**');
  for(const script of scripts){
   const label=relative(root,script).split(sep).join('/');
   console.log('KONTUR_MUTATION_RUN '+label);
   const result=spawnSync(process.execPath,[script],{
    cwd:root,stdio:'inherit',timeout:180000
   });
   if(result.error || result.status!==0){
    throw Error('Permanent mutation failed: '+label+' status '+result.status+' '+(result.error?.message||''));
   }
  }
  console.log('KONTUR_GUARD_PASS policy and '+scripts.length+' permanent mutation script(s)');
 }else{
  console.log('KONTUR_POLICY_PASS');
 }
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{main()}catch(error){console.error('KONTUR_REJECT '+error.stack);process.exitCode=1;}
}
