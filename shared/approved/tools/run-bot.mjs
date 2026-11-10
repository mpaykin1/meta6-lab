// M4: invoke Claude's existing META BOT without modifying its core.
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,lstatSync,mkdirSync,openSync,writeSync,closeSync,readFileSync,statSync,unlinkSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,relative,isAbsolute,sep,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=realpathSync(fileURLToPath(new URL('../../../',import.meta.url)));
export const MAX_RUN_MS=300_000;
const MAX_LOG_BYTES=2_000_000;
const LOCK=join(tmpdir(),'meta6-run-bot-'+createHash('sha256').update(ROOT).digest('hex').slice(0,24)+'.lock');
let inProgress=false;

function contained(parent,child){
 const rel=relative(parent,child);
 return !!rel&&rel!=='..'&&!rel.startsWith('..'+sep)&&!isAbsolute(rel);
}
function adapterFor(game){
 const dir=resolve(ROOT,game.path);
 if(!contained(ROOT,dir)||!lstatSync(dir).isDirectory()||realpathSync(dir)!==dir)throw Error('Game outside repository or symlink');
 const adapter=join(dir,'bot-adapter.js');
 if(!existsSync(adapter)||!lstatSync(adapter).isFile()||realpathSync(adapter)!==adapter){
  throw Error('нет ручки бота: '+game.id);
 }
 return dir;
}
function ownerIsAlive(pid){
 if(!Number.isSafeInteger(pid)||pid<=0)return false;
 try{process.kill(pid,0);return true}catch(e){return e.code==='EPERM'}
}
function lockRun(){
 for(let attempt=0;attempt<2;attempt++){
  try{
   const fd=openSync(LOCK,'wx',0o600);
   const token=JSON.stringify({pid:process.pid,started:Date.now()});
   try{writeSync(fd,token)}finally{closeSync(fd)}
   return ()=>{
    try{if(readFileSync(LOCK,'utf8')===token)unlinkSync(LOCK)}catch(e){if(e.code!=='ENOENT')throw e}
   };
  }catch(e){
   if(e.code!=='EEXIST')throw e;
   let owner=null,age=0;
   try{owner=JSON.parse(readFileSync(LOCK,'utf8'));age=Date.now()-statSync(LOCK).mtimeMs}
   catch(err){if(err.code==='ENOENT')continue}
   if(ownerIsAlive(owner?.pid)||age<10_000)throw Error('run_bot: уже выполняется другой запуск');
   try{unlinkSync(LOCK)}catch(err){if(err.code!=='ENOENT')throw err}
  }
 }
 throw Error('run_bot: уже выполняется другой запуск');
}
export function parseBotOutput(output){
 const runs=[];
 let current=null;
 for(const line of output.split(/\r?\n/u)){
  const header=line.match(/^\s{2}([✅❌])\s+(.+?): уровней (\d+), пройдено (\d+), FPS (.+)$/u);
  if(header){
   current={viewport:header[2],ok:header[1]==='✅',levels:Number(header[3]),passed:Number(header[4]),fps:header[5]==='—'?null:Number(header[5]),errors:[]};
   runs.push(current);
  }else if(current&&/^\s{5}-\s+/u.test(line)){
   const message=line.replace(/^\s{5}-\s+/u,'');
   current.errors.push({message,snapshot:message.match(/\[снимок:[^\]]+\]/u)?.[0]??null});
  }
 }
 return runs;
}
function execute(gamePath){
 return new Promise(resolvePromise=>{
  const argv=[join(ROOT,'scripts/meta-bot/run.mjs'),gamePath];
  const child=spawn(process.execPath,argv,{cwd:ROOT,stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'});
  let stdout='',stderr='',timedOut=false,overflow=false,spawnError=null,finished=false;
  const kill=()=>{
   try{
    if(process.platform!=='win32'&&child.pid)process.kill(-child.pid,'SIGKILL');
    else child.kill('SIGKILL');
   }catch(e){if(e.code!=='ESRCH')spawnError=spawnError||e}
  };
  const deadline=setTimeout(()=>{timedOut=true;kill()},MAX_RUN_MS);
  deadline.unref();
  const collect=(kind,chunk)=>{
   const text=chunk.toString('utf8');
   if(Buffer.byteLength(stdout)+Buffer.byteLength(stderr)+chunk.length>MAX_LOG_BYTES){
    overflow=true;kill();return;
   }
   if(kind==='stdout')stdout+=text;else stderr+=text;
  };
  child.stdout.on('data',part=>collect('stdout',part));
  child.stderr.on('data',part=>collect('stderr',part));
  child.once('error',e=>{spawnError=e});
  child.once('close',(code,signal)=>{
   if(finished)return;finished=true;clearTimeout(deadline);
   resolvePromise({code,signal,stdout,stderr,timedOut,overflow,spawnError});
  });
 });
}
export async function runBot(args={},games=[]){
 if(inProgress)throw Error('run_bot: уже выполняется другой запуск');
 if(!args||typeof args!=='object'||typeof args.id!=='string'||!args.id)throw Error('Unknown game id');
 const mode=args.mode??'full';
 if(mode!=='full')throw Error('Unsupported run_bot mode: '+String(mode));
 if(!Array.isArray(games))throw Error('Invalid game list');
 const selected=games.filter(game=>game.id===args.id);
 if(selected.length!==1)throw Error('Unknown game id: '+args.id);
 const game=selected[0];
 adapterFor(game);
 inProgress=true;
 let unlock;
 const start=Date.now();
 try{
  unlock=lockRun();
  const result=await execute(game.path);
  const runs=parseBotOutput(result.stdout);
  const errors=runs.flatMap(run=>run.errors.map(error=>({viewport:run.viewport,...error})));
  if(result.timedOut)errors.push({viewport:null,message:'run_bot: превышен лимит 300 секунд',snapshot:null});
  if(result.overflow)errors.push({viewport:null,message:'run_bot: превышен лимит журнала',snapshot:null});
  if(result.spawnError)errors.push({viewport:null,message:String(result.spawnError.message||result.spawnError),snapshot:null});
  if(result.code!==0&&!errors.length)errors.push({viewport:null,message:result.stderr.trim().slice(-2000)||'Бот завершился с ошибкой: '+String(result.code??result.signal),snapshot:null});
  if(!runs.length&&!errors.length)errors.push({viewport:null,message:'Бот не вернул результаты проверки',snapshot:null});
  for(const run of runs)if(!run.ok&&!run.errors.length)errors.push({viewport:run.viewport,message:'Бот сообщил о непрохождении без описания ошибки',snapshot:null});
  const passed=result.code===0&&!result.timedOut&&!result.overflow&&runs.length>0&&runs.every(run=>run.ok&&run.passed===run.levels);
  return {id:game.id,mode,status:passed?'прошёл':'не прошёл',passed,durationMs:Date.now()-start,timeoutMs:MAX_RUN_MS,runs,errors};
 }finally{
  try{if(unlock)unlock()}finally{inProgress=false}
 }
}
