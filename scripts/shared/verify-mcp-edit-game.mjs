import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {cpSync,writeFileSync,readFileSync,mkdirSync,mkdtempSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import readline from 'node:readline';

const root=fileURLToPath(new URL('../../',import.meta.url));
const moduleArg=process.argv.indexOf('--edit-module');
assert.ok(moduleArg<0||process.argv[moduleArg+1],'--edit-module requires a path');
const editModule=moduleArg<0?join(root,'shared/approved/tools/edit-game.mjs'):resolve(process.argv[moduleArg+1]);
const git=(directory,...args)=>execFileSync('git',['-C',directory,...args],{encoding:'utf8'}).trim();

async function serverAt(fixture,callback){
 const otherCwd=mkdtempSync(join(tmpdir(),'mcp-edit-cwd-'));
 const env={...process.env};delete env.GITHUB_TOKEN;delete env.GH_TOKEN;
 const proc=spawn(process.execPath,[join(fixture,'shared/approved/mcp.mjs')],{
  cwd:otherCwd,env,stdio:['pipe','pipe','pipe']
 });
 const pending=new Map();let next=0,stderr='';
 proc.stderr.on('data',s=>stderr+=s);
 const lines=readline.createInterface({input:proc.stdout});
 lines.on('line',line=>{
  let response;try{response=JSON.parse(line)}catch{return}
  const slot=pending.get(response.id);
  if(slot){clearTimeout(slot.timer);pending.delete(response.id);slot.resolve(response)}
 });
 function request(method,params={}){
  return new Promise((resolve,reject)=>{
   const id=++next;
   const timer=setTimeout(()=>{pending.delete(id);reject(Error('MCP timeout '+stderr))},15000);
   pending.set(id,{resolve,reject,timer});
   proc.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
  });
 }
 const call=(name,args={})=>request('tools/call',{name,arguments:args});
 try{return await callback({request,call})}
 finally{
  proc.kill();lines.close();rmSync(otherCwd,{recursive:true,force:true});
  for(const slot of pending.values()){clearTimeout(slot.timer);slot.reject(Error('Server ended'))}
 }
}
function fixture(){
 const dir=mkdtempSync(join(tmpdir(),'mcp-edit-fixture-'));
 const approved=join(dir,'shared/approved');mkdirSync(join(approved,'tools'),{recursive:true});
 cpSync(join(root,'shared/approved/mcp.mjs'),join(approved,'mcp.mjs'));
 // Other MCP tool modules live beside edit-game (run-bot, library…): copy them all, then the module under test.
 cpSync(join(root,'shared/approved/tools'),join(approved,'tools'),{recursive:true});
 cpSync(editModule,join(approved,'tools/edit-game.mjs'));
 writeFileSync(join(approved,'search.mjs'),['export const approvedComponents=()=>[];',
  'export const searchApproved=()=>[];', 'export const inspectApproved=()=>({});',
  'export const getApprovedSource=()=>({});'].join('\n'));
 mkdirSync(join(dir,'meta-games'),{recursive:true});
 writeFileSync(join(dir,'meta-games/index.html'),'<a class="game" href="../games/example/"><h3>Example</h3></a>\n'+
  '<a class="game" href="../observer-world-en-v7/"><h3>Reference</h3></a>');
 mkdirSync(join(dir,'games/example/nested'),{recursive:true});
 mkdirSync(join(dir,'games/unlisted'),{recursive:true});
 mkdirSync(join(dir,'observer-world-en-v7'),{recursive:true});
 writeFileSync(join(dir,'games/example/index.html'),'<title>Original</title>\nunique-token\n');
 writeFileSync(join(dir,'games/example/nested/dupes.txt'),'twice twice\n');
 writeFileSync(join(dir,'games/example/nested/binary.dat'),Buffer.from([0,1,255,3]));
 writeFileSync(join(dir,'games/example/nested/preview.png'),'ASCII in binary extension');
 writeFileSync(join(dir,'games/unlisted/index.html'),'unlisted-secret\n');
 writeFileSync(join(dir,'observer-world-en-v7/index.html'),'protected-reference\n');
 writeFileSync(join(dir,'secret.txt'),'outside\n');
 execFileSync('git',['init','-q','-b','main',dir]);
 git(dir,'config','user.name','Fixture');git(dir,'config','user.email','fixture@example.test');
 git(dir,'remote','add','origin','https://github.com/mpaykin1/meta6-lab.git');
 git(dir,'add','.');git(dir,'commit','-qm','Initial fixture');
 symlinkSync(join(dir,'secret.txt'),join(dir,'games/example/escape.txt'));
 return dir;
}
async function check(){
 const dir=fixture();
 try{
  const initial=git(dir,'rev-parse','HEAD');
  const args={id:'example',file:'index.html',old_text:'unique-token',new_text:'fresh-token',message:'Change gameplay text'};
  await serverAt(dir,async({request,call})=>{
   for(const init of [{protocolVersion:'2025-03-26',capabilities:{}},{}]){
    assert.ok((await request('initialize',init)).result,'initialize failed');
    const list=await request('tools/list');
    assert.ok(list.result?.tools?.some(t=>t.name==='edit_game'),'edit_game missing');
   }
   const games=await call('list_games');
   assert.equal(JSON.parse(games.result.content[0].text).length,2,'Dynamic game list missing');
   const response=await call('edit_game',args);
   assert.ok(response.result?.content?.[0]?.text,'Valid edit rejected: '+JSON.stringify(response.error));
   const result=JSON.parse(response.result.content[0].text);
   assert.match(result.branch,/^mcp-edit\/example-[0-9a-f]{12}$/);
   assert.match(result.commit,/^[0-9a-f]{40}$/);
   assert.match(result.diff,/^diff --git a\/games\/example\/index.html b\/games\/example\/index.html/m);
   assert.ok(result.diff.includes('+fresh-token'),'Diff omitted edit');
   assert.equal(result.pushed,false,'Tokenless edit attempted push');
   assert.equal(result.pr,null,'Tokenless edit attempted PR');
   assert.equal(git(dir,'rev-parse','HEAD'),initial,'HEAD moved');
   assert.equal(git(dir,'rev-parse','main'),initial,'main moved');
   assert.equal(git(dir,'branch','--show-current'),'main','Current branch changed');
   assert.equal(git(dir,'rev-parse',result.branch),result.commit,'Branch ref missing');
   assert.equal(git(dir,'show',result.commit+':games/example/index.html'),'<title>Original</title>\nfresh-token');
   assert.equal(readFileSync(join(dir,'games/example/index.html'),'utf8'),'<title>Original</title>\nunique-token\n');
   assert.deepEqual(git(dir,'diff-tree','--no-commit-id','--name-only','-r',result.commit).split('\n'),['games/example/index.html']);
   const count=()=>git(dir,'branch','--list','mcp-edit/*').split('\n').filter(Boolean).length;
   assert.equal(count(),1);
   async function rejected(name,input,pattern){
    const reply=await call('edit_game',input);
    assert.ok(reply.error,'Unexpected accepted '+name+' '+JSON.stringify(reply.result));
    if(pattern)assert.match(reply.error.message,pattern,name+' incorrect rejection');
    assert.equal(count(),1,'Rejected request created branch: '+name);
    assert.equal(git(dir,'rev-parse','HEAD'),initial,'Rejected request changed HEAD: '+name);
    assert.equal(git(dir,'rev-parse','main'),initial,'Rejected request changed main: '+name);
   }
   await rejected('allowlist-deception',{...args,id:'unlisted',file:'index.html',old_text:'unlisted-secret'},/Unknown game/);
   await rejected('unknown-id',{...args,id:'not-present'},/Unknown game/);
   await rejected('outside-games',{...args,id:'observer-world-en-v7',old_text:'protected-reference'},/games\//);
   await rejected('traversal',{...args,file:'../secret.txt'},/path/i);
   await rejected('absolute',{...args,file:'/etc/passwd'},/path/i);
   await rejected('windows-absolute',{...args,file:'C:\\Windows\\win.ini'},/path/i);
   await rejected('symlink',{...args,file:'escape.txt'},/Symlink/);
   await rejected('binary-extension',{...args,file:'nested/preview.png'},/Binary/);
   await rejected('binary-bytes',{...args,file:'nested/binary.dat'},/Binary/);
   await rejected('missing-old',{...args,old_text:'NOT_PRESENT'},/exactly once/);
   await rejected('duplicated-old',{...args,file:'nested/dupes.txt',old_text:'twice'},/exactly once/);
   await rejected('no-op',{...args,new_text:'unique-token'},/No-op/);
   await rejected('protected-stand',{...args,file:'stand/index.html'},/path/i);
   // Dirty worktree must not be silently ignored: the new branch must match the visible source.
   writeFileSync(join(dir,'games/example/index.html'),'<title>Local variant</title>\nunique-token\n');
   await rejected('dirty-worktree',args,/differs from HEAD/);
   writeFileSync(join(dir,'games/example/index.html'),'<title>Original</title>\nunique-token\n');
   git(dir,'remote','set-url','origin','https://github.com/not-owner/not-lab.git');
   await rejected('wrong-repository',args,/Repository is not/);
   git(dir,'remote','set-url','origin','https://github.com/mpaykin1/meta6-lab.git');
  });
  assert.equal(git(dir,'status','--porcelain'), '?? games/example/escape.txt', 'Working tree changed by edit_game');
  console.log('MCP_EDIT_GAME_PASS branch-only edit, unchanged main/HEAD/worktree, diff, independent cwd, 15 rejected attacks');
 }finally{rmSync(dir,{recursive:true,force:true})}
}
check().catch(error=>{console.error('MCP_EDIT_GAME_FAIL '+(error.stack||error));process.exitCode=1});
