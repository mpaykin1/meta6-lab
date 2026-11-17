// Permanent contract and mutation probes for owner-approved Last Healer video order.
// This protects input facts without editing accepted reference worlds or bot thresholds.
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const source=['incoming','ready']
 .map(stage=>join(repo,'asset-packs',stage,'last-healer-video'))
 .find(folder=>existsSync(join(folder,'ZAKAZ.json')));
if(!source)throw Error('Last Healer video order must not disappear');
const original=JSON.parse(readFileSync(join(source,'ZAKAZ.json'),'utf8'));
const kinds=new Set(['2d','2.5d','3d','sound','music','effect','ui','tile','background']);
function issues(z){
  const e=[];
  if(z?.format!=='mg-zakaz/1')e.push('format');
  if(z?.source?.type!=='video')e.push('source.type');
  if(!z?.source?.source||typeof z.source.source!=='string')e.push('source.source');
  if(!(Number(z?.source?.duration_s)>0))e.push('source.duration_s');
  if(!Array.isArray(z?.items)||z.items.length<24){e.push('items');return e;}
  const ids=new Set();
  for(const i of z.items){
    if(!i.id||ids.has(i.id))e.push('id');
    ids.add(i.id);
    if(!i.name_ru||!i.seen_at||!Array.isArray(i.must)||!i.must.length)e.push('metadata:'+i.id);
    if(!kinds.has(i.kind))e.push('kind:'+i.id);
    if(!i.frame||!existsSync(join(source,i.frame)))e.push('frame:'+i.id);
  }
  return e;
}
if(issues(original).length)throw Error('Video order violates Z1/Z2/Z3: '+issues(original).join(','));
let caught=0;
const mutate=(label,edit)=>{
  const sample=JSON.parse(JSON.stringify(original));edit(sample);
  if(!issues(sample).length)throw Error('Missed video-order mutant: '+label);
  caught++;
};
mutate('no source',z=>delete z.source.source);
mutate('zero duration',z=>z.source.duration_s=0);
mutate('postfx instead of supported effect',z=>z.items[0].kind='postfx');
mutate('duplicate ID',z=>z.items[1].id=z.items[0].id);
mutate('no video frame',z=>z.items[0].frame='zakaz/frames/does-not-exist.jpg');
mutate('empty must',z=>z.items[0].must=[]);
mutate('order dropped',z=>z.items.length=3);
console.log('LAST_HEALER_ZAKAZ_MUTANTS '+caught+'/'+caught+' caught');
