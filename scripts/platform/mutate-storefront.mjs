import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';

// KONTUR guard invokes every permanent mutation on fresh Node runners.
// Bootstrap the free test dependencies instead of silently skipping traps.
const repositoryRoot=fileURLToPath(new URL('../../',import.meta.url));
const require=createRequire(import.meta.url);
let missingPackages=false;
try {require.resolve('playwright');require.resolve('pngjs');}
catch {missingPackages=true;}
if(missingPackages) {
  const install=spawnSync('npm',['install','--no-save','--no-package-lock',
    'playwright@1.56.1','pngjs@7.0.0'],{cwd:repositoryRoot,stdio:'inherit',timeout:90000});
  assert.equal(install.status,0,'Permanent mutation could not install browser test libraries');
}
const {chromium}=require('playwright');
if(!existsSync(chromium.executablePath()) &&
   !existsSync('/usr/bin/google-chrome') &&
   !existsSync('/opt/google/chrome/chrome')) {
  const install=spawnSync('npx',['--no-install','playwright','install','chromium'],
    {cwd:repositoryRoot,stdio:'inherit',timeout:90000});
  assert.equal(install.status,0,'Permanent mutation could not install Chromium');
}
const checker=fileURLToPath(new URL('./verify-storefront.mjs',import.meta.url));
const checkerSource=readFileSync(checker,'utf8');
const scratch=mkdtempSync(join(tmpdir(),'p1-storefront-mutate-'));
const htmlFile=join(scratch,'meta-games/index.html');
const gameFile=join(scratch,'games/valid/index.html');
const game2File=join(scratch,'games/second/index.html');
const validGame="<!doctype html><html><body style=\"margin:0;background:#090b10\"><canvas id=\"game\" width=\"256\" height=\"144\" style=\"width:100vw;height:100vh\"></canvas><script>\nconst ctx=document.querySelector('canvas').getContext('2d');\nconst colors=['#d82d39','#268adc','#ead27a','#28bd79','#ac4ce0','#ee8b31'];\ncolors.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(i*43,0,44,144);});\n</script></body></html>".replace('<body','<head><link rel="icon" href="data:,"></head><body');
const index="<!doctype html><body><div class=\"games\">\n<a class=\"game\" href=\"../games/valid/\"><h3>Valid one</h3></a>\n<a class=\"game\" href=\"../games/second/\"><h3>Valid two</h3></a>\n</div></body>";

function run(file,flags=[]) {
  return spawnSync(process.execPath,[file,'--root',scratch,'--hold-ms','100',...flags],{
    encoding:'utf8',timeout:90000,cwd:tmpdir()
  });
}
function requirePass(label,file,flags=[]) {
  const result=run(file,flags);
  assert.equal(result.status,0,label+' must pass:\n'+result.stdout+'\n'+result.stderr);
}
function requireFailure(label,file,flags=[]) {
  const result=run(file,flags);
  assert.notEqual(result.status,0,label+' must be detected:\n'+result.stdout+'\n'+result.stderr);
  assert.match(result.stderr,/P1 FAIL|P1 FATAL/,'Failure must come from the P1 browser checker');
  console.log('P1 MUTATION CAUGHT',label);
}
try {
  mkdirSync(dirname(htmlFile),{recursive:true});
  mkdirSync(dirname(gameFile),{recursive:true});
  mkdirSync(dirname(game2File),{recursive:true});
  writeFileSync(htmlFile,index);
  writeFileSync(gameFile,validGame);
  writeFileSync(game2File,validGame);
  requirePass('Unmodified game fixture',checker);
  requirePass('Dynamic storefront discovery',checker,['--probe']);

  // Regression trap (OSHIBKI #4): continuous canvas movement must not
  // falsely fail because a Playwright element screenshot waits for stability.
  const animated=validGame.replace('</script>',
    "document.querySelector('canvas').animate([{transform:'translateX(0px)'},{transform:'translateX(180px)'}],{duration:300,iterations:Infinity,direction:'alternate'});</script>");
  writeFileSync(gameFile,animated);
  requirePass('moving animated canvas must be sampled without waiting for stability',checker);
  const unstableAnchor="const colors=pixelColors(Buffer.from(capture.data,'base64'));";
  assert.ok(checkerSource.includes(unstableAnchor),'Animation regression mutation anchor not found');
  const unstableMutant=join(dirname(checker),'verify-storefront-unstable-'+randomUUID()+'.mjs');
  try {
    assert.ok(checkerSource.includes('if(direct.bins>=4 && direct.nonDominant>=0.005)'));
    writeFileSync(unstableMutant,checkerSource
      .replace('if(direct.bins>=4 && direct.nonDominant>=0.005)','if(false)')
      .replace(unstableAnchor,
        'const colors=pixelColors(await canvas.screenshot({timeout:6000}));'));
    requireFailure('unstable animated canvas screenshot',unstableMutant);
  } finally {rmSync(unstableMutant,{force:true});}
  writeFileSync(gameFile,validGame);

  // Fault 1: a canvas exists and has nonzero size, but is uniformly painted.
  writeFileSync(gameFile,validGame.replace('colors.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(i*43,0,44,144);});',
    "ctx.fillStyle='#2c3749';ctx.fillRect(0,0,256,144);"));
  requireFailure('single-color canvas',checker);
  writeFileSync(gameFile,validGame);

  // Fault 2: a colorful UI strip must never count as the game canvas.
  // The large game canvas underneath is intentionally uniform black.
  const uiOnly='<!doctype html><html><body style="margin:0;background:#000">'
    +'<canvas width="80" height="12" style="position:absolute;top:0;left:0;width:80px;height:12px;z-index:2"></canvas>'
    +'<canvas width="256" height="144" style="display:block;width:100vw;height:100vh;background:#000"></canvas>'
    +'<script>const c=document.querySelectorAll("canvas");const ui=c[0].getContext("2d");'
    +'["#db4141","#2c8bd7","#cce25f","#6be0b4","#b046dd","#eea358"].forEach((color,i)=>{ui.fillStyle=color;ui.fillRect(i*14,0,14,12)});'
    +'const game=c[1].getContext("2d");game.fillStyle="#000";game.fillRect(0,0,256,144);</script></body></html>';
  writeFileSync(gameFile,uiOnly);
  requireFailure('small colorful UI is not a rendered game canvas',checker);
  writeFileSync(gameFile,validGame);

  // Fault 2: HTML returns 200 but has no canvas.
  writeFileSync(game2File,'<!doctype html><title>Missing canvas</title><p>No game</p>');
  requireFailure('no canvas despite HTTP 200',checker);
  writeFileSync(game2File,validGame);

  // Fault 3: missing game entrypoint returns HTTP 404.
  writeFileSync(htmlFile,index.replace('../games/second/','../games/not-found/'));
  requireFailure('game HTTP 404',checker);
  writeFileSync(htmlFile,index);

  // Fault 4, OBMAN: a checker hardcodes the game list instead of reading HTML.
  const anchor='  const games=[];';
  assert.ok(checkerSource.includes(anchor),'Hardcode mutation anchor disappeared');
  const mutant=join(dirname(checker),'verify-storefront-mutant-'+randomUUID()+'.mjs');
  try {
    writeFileSync(mutant,checkerSource.replace(anchor,
      "return [{title:'Valid one',path:'/games/valid/'},{title:'Valid two',path:'/games/second/'}];\n  const games=[];"));
    requireFailure('hardcoded storefront list (obman)',mutant,['--probe']);
  } finally {rmSync(mutant,{force:true});}
  console.log('P1 STOREFRONT MUTATIONS PASS (4 faults rejected)');
} finally {rmSync(scratch,{recursive:true,force:true});}
