import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
test('§21.17 lab scout is a measured 8-direction 8-frame atlas and stays out of game',async()=>{
 const [svg,metrics,index,manifest]=await Promise.all([
  readFile(new URL('models-lab/gpt-rift-scout-v1.svg',root),'utf8'),
  readFile(new URL('models-lab/gpt-rift-scout-v1.metrics.json',root),'utf8').then(JSON.parse),
  readFile(new URL('index.source.html',root),'utf8'),
  readFile(new URL('models/MANIFEST.json',root),'utf8')
 ]);
 const cells=[...svg.matchAll(/<g data-d="(\d)" data-a="(\d)"/g)];
 assert.equal(cells.length,64);
 assert.equal(new Set(cells.map(x=>x[1])).size,8);
 assert.equal(new Set(cells.map(x=>x[2])).size,8);
 const facing=[...svg.matchAll(/data-f="([^"]+)"/g)].map(match=>match[1]);
 assert.equal(facing.length,64,'every atlas cell needs an authored facing cue');
 assert.equal(new Set(facing).size,8,'eight directions need eight distinct authored cues, not scale-only views');
 const beaconPulses=[...svg.matchAll(/data-m="b"[^>]*r="([^"]+)"[^>]*opacity="([^"]+)"/g)];
 assert.equal(beaconPulses.length,64,'every atlas cell needs an animated beacon sample');
 assert.equal(new Set(beaconPulses.map(match=>match[1])).size,5,'beacon radius must pulse across the animation, not stay static');
 assert.equal(new Set(beaconPulses.map(match=>match[2])).size,5,'beacon opacity must pulse across the animation, not stay static');
 for(const name of new Set(facing))assert.equal(facing.filter(value=>value===name).length,8,`facing cue ${name} must cover all frames`);
 assert.match(svg,/data-palette-colors="14"/);
 assert.match(svg,/data-parts="15"/);
 assert.match(svg,/data-reused-defs="45"/);
 assert.equal((svg.match(/<use\b/g)||[]).length,896,'repeated rendered geometry must use shared definitions');
 assert.equal(Buffer.byteLength(svg),61644,'optimized lab atlas raw size is a measured contract');
 const usedColors=new Set([...svg.matchAll(/(?:fill|stroke)="(#[0-9a-f]{6})"/g)].map(match=>match[1]));
 assert.equal(usedColors.size,14,'declared palette must match colors actually rendered');
 assert.equal(metrics.candidate.metrics.paletteColors,14);
 assert.equal(metrics.status,'lab-only-unreviewed');
 assert.equal(metrics.gameIntegration,false);
 assert.equal(metrics.candidate.metrics.animationFrames,8);
 assert.equal(metrics.candidate.metrics.viewDirections,8);
 assert.equal(metrics.candidate.metrics.articulatedVisualLayers,15);
 assert.equal(metrics.promotionGate.visualParity,'UNKNOWN');
 assert.equal(metrics.promotionGate.fpsP50P95,'UNKNOWN');
 assert(!index.includes('gpt-rift-scout-v1'),'unreviewed lab asset leaked into game source');
 assert(!manifest.includes('gpt-rift-scout-v1'),'unreviewed lab asset leaked into accepted model manifest');
});
