// META GAMES: Archer must not restore any ad SDK or rewarded-ad revive path.
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const repositoryRoot=fileURLToPath(new URL('../../',import.meta.url));
const index=process.argv.indexOf('--root');
assert.ok(index<0 || process.argv[index+1], 'Missing --root value');
const root=index<0?repositoryRoot:resolve(process.argv[index+1]);
const game='games/archer-in-the-fog/';
const read=(path)=>readFileSync(join(root,game,path),'utf8');

function verify(){
  const html=read('index.html');
  const source=read('src/arc2_module.js');
  const bundle=read('assets/index-xsRfS2lk.js');
  assert.equal(existsSync(join(root,game,'playgama-bridge.js')),false,
    'META build must not ship Playgama bridge');
  for(const [name,content] of [['index.html',html],['src/arc2_module.js',source],
    ['assets/index-xsRfS2lk.js',bundle]]){
    const code=content.replace(/\/\*[\s\S]*?\*\//g,'')
      .replace(/^\s*\/\/[^\n]*$/gm,'')
      .replace(/\[\s*(["'])([a-z_$][\w$]*)\1\s*\]/gi,'.$2');
    assert.doesNotMatch(code,
      /(?:showRewarded|showInterstitial|showBanner|advertisement|playgama-bridge|(?:window|globalThis)\.bridge)/i,
      name+' contains advertising SDK or API');
  }
  assert.match(html,/src=["']\.\/bot-adapter\.js["']/,
    'Live read-only META BOT adapter must remain loaded');
  assert.match(bundle,/bRevive/,'Shipped game must expose real revive action');
  assert.match(source,/\$\("bRevive"\)\.onclick\s*=/,
    'Reusable source must keep the actual revive button handler');
  assert.match(source,/b\.hidden\s*=\s*!!G\.revived\s*;/,
    'Free revive offer cannot depend on ad support');
  assert.match(source,/G\.revived\s*=\s*!0\s*;/,
    'Revive must be limited to one real use');
  console.log('ARCHER_ADFREE_PASS no ad SDK, source/runtime parity and one free revive');
}
try{verify()}catch(error){console.error('ARCHER_ADFREE_REJECT '+error.message);process.exitCode=1;}
