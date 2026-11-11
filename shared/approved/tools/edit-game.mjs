// M3/M5: commit an exact one-occurrence game edit without touching HEAD, main, or the worktree.
import {execFileSync} from 'node:child_process';
import {createHash,randomBytes} from 'node:crypto';
import {mkdtempSync,readFileSync,lstatSync,realpathSync,rmSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,relative,isAbsolute,sep,win32} from 'node:path';

const expectedRepository='mpaykin1/meta6-lab';
const denyBinary=/\.(?:png|jpe?g|gif|webp|avif|ico|bmp|tiff?|glb|gltf|bin|wasm|mp3|ogg|opus|wav|flac|aac|m4a|mp4|webm|mov|zip|gz|7z|rar|pdf|woff2?|ttf|otf|ktx2?|basis|hdr|exr|db|sqlite3?)$/i;
const forbiddenGameParts=new Set(['reference','references','original','originals','stand','golden','accepted']);
const gitEnv=Object.fromEntries(Object.entries(process.env).filter(([key])=>
 !/^GIT_(?:DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|COMMON_DIR|NAMESPACE|CONFIG_|CEILING_DIRECTORIES)/.test(key)));

function git(root,args,options={}){
 return execFileSync('git',['-C',root,...args],{
  env:{...gitEnv,...options.env},input:options.input,encoding:options.encoding||'utf8',
  maxBuffer:48*1024*1024,timeout:30000,stdio:['pipe','pipe','pipe']
 });
}
function inside(base,target){
 const rel=relative(base,target);
 return !!rel&&rel!=='..'&&!rel.startsWith('..'+sep)&&!isAbsolute(rel);
}
function checkFilePath(file){
 if(typeof file!=='string'||!file||file.length>1024||file.includes('..')||
    file.includes('\\')||file.includes('\0')||isAbsolute(file)||win32.isAbsolute(file)||
    file.split('/').some(part=>!part||part==='.'||part==='.git'||forbiddenGameParts.has(part.toLowerCase()))){
  throw Error('Invalid or protected game file path');
 }
}
function textBytes(bytes){
 if(bytes.includes(0))throw Error('Binary files are forbidden');
 try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes)}
 catch{throw Error('Binary files are forbidden')}
}
function checkedRepo(root){
 const actual=realpathSync(root);
 if(git(actual,['rev-parse','--show-toplevel']).trim()!==actual)throw Error('Not the repository root');
 const origin=git(actual,['remote','get-url','origin']).trim();
 if(!/^(?:https:\/\/github\.com\/mpaykin1\/meta6-lab(?:\.git)?|git@github\.com:mpaykin1\/meta6-lab(?:\.git)?)$/i.test(origin)){
  throw Error('Repository is not '+expectedRepository);
 }
 // Refuse submodules and nested repositories; read/write only one tracked file in this repository.
 const common=realpathSync(git(actual,['rev-parse','--git-common-dir']).trim().startsWith('/')?
  git(actual,['rev-parse','--git-common-dir']).trim():resolve(actual,git(actual,['rev-parse','--git-common-dir']).trim()));
 if(!inside(actual,common))throw Error('Git metadata outside repository');
 return actual;
}
function gameFile(root,game,file){
 if(typeof game?.path!=='string'||!/^games\/[a-z0-9-]+$/.test(game.path)||game.id!==game.path.slice(6)){
  throw Error('Only listed editable games under games/ are allowed');
 }
 checkFilePath(file);
 const directory=resolve(root,game.path);
 if(!inside(root,directory))throw Error('Game outside repository');
 let cursor=root;
 for(const part of [...game.path.split('/'),...file.split('/')]){
  cursor=join(cursor,part);
  const info=lstatSync(cursor);
  if(info.isSymbolicLink())throw Error('Symlink forbidden');
 }
 const full=resolve(directory,file);
 if(!inside(directory,full)||!statSync(full).isFile())throw Error('Not a regular game file');
 if(denyBinary.test(file))throw Error('Binary files are forbidden');
 return {full,gitPath:game.path+'/'+file};
}

async function publish(root,branch,token){
 // Token is passed only through the child process environment, never a command argument.
 const encoded=Buffer.from('x-access-token:'+token,'utf8').toString('base64');
 git(root,['push','--porcelain','https://github.com/mpaykin1/meta6-lab.git',
  'refs/heads/'+branch+':refs/heads/'+branch],{env:{
   GIT_CONFIG_COUNT:'1',GIT_CONFIG_KEY_0:'http.https://github.com/.extraheader',
   GIT_CONFIG_VALUE_0:'AUTHORIZATION: basic '+encoded,
   GIT_TERMINAL_PROMPT:'0'
  }});
 const response=await fetch('https://api.github.com/repos/mpaykin1/meta6-lab/pulls',{
  method:'POST',headers:{
   authorization:'Bearer '+token,accept:'application/vnd.github+json',
   'X-GitHub-Api-Version':'2022-11-28','content-type':'application/json'
  },body:JSON.stringify({title:'MCP edit_game: '+branch,head:branch,base:'main',
   body:'Automated proposed game edit. Branch only; review before merging.'})
 });
 if(!response.ok)throw Error('PR API rejected request: HTTP '+response.status);
 const pr=await response.json();
 return {url:pr.html_url,number:pr.number};
}

export async function editGame(args,{repositoryRoot,listGames}){
 if(!args||typeof args!=='object')throw Error('Arguments required');
 const {id,file,old_text,new_text,message}=args;
 if(typeof id!=='string'||!/^[a-z0-9-]+$/.test(id))throw Error('Unknown game id');
 if(typeof old_text!=='string'||!old_text||typeof new_text!=='string'||
    typeof message!=='string'||!message.trim()||message.length>240||/[\r\n\0]/.test(message)||
    old_text.includes('\0')||new_text.includes('\0'))throw Error('Invalid edit text or message');
 if(old_text===new_text)throw Error('No-op edit forbidden');
 const root=checkedRepo(repositoryRoot);
 const games=listGames().filter(game=>game.id===id);
 if(games.length!==1)throw Error('Unknown game id: '+id);
 const {full,gitPath}=gameFile(root,games[0],file);
 const onDisk=readFileSync(full);
 const current=textBytes(onDisk);
 const parent=git(root,['rev-parse','--verify','HEAD^{commit}']).trim();
 const committedBytes=git(root,['show',parent+':'+gitPath],{encoding:'buffer'});
 const original=textBytes(committedBytes);
 if(!committedBytes.equals(onDisk))throw Error('Game file differs from HEAD; refuse uncommitted edits');
 const occurrences=original.split(old_text).length-1;
 if(occurrences!==1)throw Error('old_text must occur exactly once (found '+occurrences+')');
 const updated=original.replace(old_text,new_text);
 const entry=git(root,['ls-tree',parent,'--',gitPath]).trim();
 const mode=/^(100644|100755) blob [a-f0-9]{40,64}\t/.exec(entry)?.[1];
 if(!mode)throw Error('File is not a tracked regular text blob');
 const temporary=mkdtempSync(join(tmpdir(),'mcp-game-edit-'));
 let commit;
 try{
  const env={GIT_INDEX_FILE:join(temporary,'index')};
  const blob=git(root,['hash-object','-w','--stdin'],{input:Buffer.from(updated),env}).trim();
  git(root,['read-tree',parent],{env});
  git(root,['update-index','--add','--cacheinfo',mode+','+blob+','+gitPath],{env});
  const tree=git(root,['write-tree'],{env}).trim();
  commit=git(root,['-c','user.name=META GAMES MCP','-c','user.email=mcp@users.noreply.github.com',
   'commit-tree',tree,'-p',parent,'-m',message],{env}).trim();
 }finally{rmSync(temporary,{recursive:true,force:true})}
 const hash=createHash('sha256').update(parent+'\0'+gitPath+'\0'+commit+'\0').update(randomBytes(16)).digest('hex').slice(0,12);
 const branch='mcp-edit/'+id+'-'+hash;
 git(root,['check-ref-format','--branch',branch]);
 // Atomic create-only update: cannot replace an existing ref, including main or current branch.
 git(root,['update-ref','refs/heads/'+branch,commit,'0000000000000000000000000000000000000000']);
 const diff=git(root,['diff','--no-ext-diff','--no-textconv','--unified=3',parent,commit,'--',gitPath]);
 const result={branch,commit,diff,pushed:false,pr:null};
 const {GITHUB_TOKEN,GH_TOKEN}=process.env;
 const token=GITHUB_TOKEN||GH_TOKEN;
 if(token){
  try{result.pr=await publish(root,branch,token);result.pushed=true}
  catch(error){result.publish_error=String(error.message||error)}
 }
 return result;
}
