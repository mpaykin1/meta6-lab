import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { contentDigest, buildCatalog } from './build-catalog.mjs';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'meta-games-integrity-'));
try{
 fs.mkdirSync(path.join(tmp,'sub'));
 fs.writeFileSync(path.join(tmp,'index.html'),'<h1>A</h1>');
 fs.writeFileSync(path.join(tmp,'sub','shader.glsl'),'alpha');
 const a=contentDigest(tmp);
 assert.match(a,/^[a-f0-9]{64}$/);
 assert.equal(contentDigest(tmp),a,'same files need same digest');
 fs.writeFileSync(path.join(tmp,'sub','shader.glsl'),'beta');
 assert.notEqual(contentDigest(tmp),a,'asset change invalidates eligibility');
 fs.symlinkSync(path.join(tmp,'index.html'),path.join(tmp,'sub','linked.html'));
 assert.throws(()=>contentDigest(tmp),/Symlinked game asset/);
 fs.rmSync(path.join(tmp,'sub','linked.html'));
 const catalog=buildCatalog();
 const portal = fs.readFileSync(new URL('../../meta-games/index.html', import.meta.url), 'utf8');
 const gameCards = [...portal.matchAll(/<a\b[^>]*>/gi)].filter(([tag]) =>
   /\bclass\s*=\s*(['"])[^'"]*\bgame\b[^'"]*\1/i.test(tag));
 assert.ok(gameCards.length > 0, 'portal must provide game cards');
 assert.equal(catalog.games.length, gameCards.length,
   'native catalog must include every game card from the live portal');
 for(const game of catalog.games){
  assert.match(game.contentSha256,/^[a-f0-9]{64}$/);
  assert.equal(game.steamEligible,false);
  assert.equal(game.androidEligible,false);
 }
 console.log('NATIVE_GAME_INTEGRITY_PASS: dynamic game count, asset changes invalidate approvals, symlinks forbidden');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
