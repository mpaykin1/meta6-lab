// Conservative META BOT repair loop. Operates on sandbox game copies only.
// Preserves the protected bot, original owner builds, and the failing candidate on rollback.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
function sandboxGame(raw) {
  if(typeof raw!=='string'||!/^games\/[a-z0-9][a-z0-9._-]*$/i.test(raw)) throw Error('Only games/<id> working copies are allowed');
  const dir=path.resolve(root,raw);
  const real=fs.realpathSync(dir);
  if(!real.startsWith(path.join(root,'games')+path.sep))throw Error('Game directory escapes sandbox');
  const file=path.join(real,'index.html');
  if(!fs.existsSync(file)||!fs.existsSync(path.join(real,'bot.json'))||
     !fs.existsSync(path.join(real,'bot-strategy.mjs')))throw Error('Requires onboarded game with bot.json and strategy');
  const cfg=JSON.parse(fs.readFileSync(path.join(real,'bot.json'),'utf8'));
  if(!Array.isArray(cfg.skipChecks)||cfg.skipChecks.length)throw Error('Cannot repair games with skipped bot checks');
  return {dir:raw,file};
}
function bot(game){
  const r=spawnSync(process.execPath,['scripts/meta-bot/run.mjs',game.dir],{
    cwd:root,encoding:'utf8',timeout:56*60*1000,
    env:{...process.env,CI:'true'},maxBuffer:8*1024*1024
  });
  const output=[r.stdout,r.stderr].filter(Boolean).join('\n');
  if(r.error) throw r.error;
  return {ok:r.status===0,output};
}
const FIX_CSS='<style data-meta-bot-repair="fix-viewport">html,body{max-width:100%;height:100%;overflow:hidden;overscroll-behavior:none}canvas{touch-action:none}html{-webkit-text-size-adjust:100%}</style>';
function safeViewportRepair(html) {
  if(html.includes('data-meta-bot-repair="fix-viewport"'))return null;
  if(!/<\/head\s*>/i.test(html))return null;
  return html.replace(/<\/head\s*>/i,FIX_CSS+'</head>');
}
function selectGame() {
  const dirs=fs.readdirSync(path.join(root,'games'),{withFileTypes:true})
    .filter(d=>d.isDirectory()).map(d=>'games/'+d.name)
    .filter(d=>['bot.json','bot-strategy.mjs','index.html'].every(n=>fs.existsSync(path.join(root,d,n))));
  if(!dirs.length)throw Error('No onboarded games available');
  const index=Number(process.env.GITHUB_RUN_NUMBER||0);
  return dirs.sort()[index%dirs.length];
}
const raw=process.argv[2]||selectGame();
const game=sandboxGame(raw);
const original=fs.readFileSync(game.file,'utf8');
const first=bot(game);
if(first.ok){console.log('BOT_ALREADY_PASS '+game.dir);process.exit(0)}
// Never guess how to correct gameplay, missing assets, cheats, invisible goals or FPS.
if(!/FIX[:：]|(?:screen|canvas|экран).{0,120}(?:scroll|сдвинул|прокрут)/i.test(first.output)){
  console.error('BOT_FAIL_NO_SAFE_FIX '+game.dir);
  process.exit(1);
}
const next=safeViewportRepair(original);
if(!next){console.error('BOT_FAIL_ALREADY_REPAIRED_OR_INCOMPATIBLE '+game.dir);process.exit(1)}
try{
  fs.writeFileSync(game.file,next);
  const second=bot(game);
  if(!second.ok){console.error('BOT_REPAIR_REJECTED '+game.dir);process.exitCode=1}
  else{console.log('BOT_REPAIR_VERIFIED '+game.dir);process.exitCode=0}
}finally{
  if(process.exitCode!==0)fs.writeFileSync(game.file,original);
}
