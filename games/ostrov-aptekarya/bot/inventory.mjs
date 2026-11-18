// Chapter I inventory frozen at main 32c887295480ff6610be4da1636ae2c994b119e7.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(dir,f),'utf8');
const baseline={
  AT_shop: [2,'d6375faa'],
  IVA_implant: [5,'76d65f89'],
  AT_bench: [3,'321112f1'],
  AT_car: [4,'d998d6fe'],
  AT_lamp: [2,'827445b2'],
  AT_sign: [4,'3f2aff65'],
  AT_shroomsRed: [2,'bd038501'],
  AT_deer: [2,'2829db84'],
  AT_robot: [7,'cf6f55fe'],
  AT_shrine: [3,'384b58d2'],
  AT_bridge: [3,'2f283bd8'],
  AT_mill: [3,'dd7dc3ee'],
  AT_fox: [4,'200e6b9b'],
  AT_hut: [4,'f93924c8'],
  AT_pier: [3,'9b4893ff'],
  AT_boat: [3,'941c59c3'],
  AT_islet: [2,'b21383e5'],
  SEE_herb: [2,'a4abd8a8'],
  SEE_shroom: [2,'315ac01f'],
  herb1: [1,'1b670906'],
  herb2: [2,'4584d39a'],
  herb3: [2,'6f5c6385'],
  shroom1: [1,'14e9367a'],
  shroom2: [2,'ff97df7b'],
  water: [5,'8ca70472'],
  dusk1: [2,'59d33f18'],
  dusk2: [3,'8435f557'],
  tell: [4,'aee5f851'],
  tellLate: [3,'861d1711'],
  hint: [1,'b97ae711'],
  grab: [2,'7edb951a'],
  dust: [1,'70feb51f'],
  breakFree: [1,'cfab2a3f'],
  caught: [1,'7cdd1b90'],
  caughtAfter: [1,'f81b9eab'],
  faint: [2,'eb979e41'],
  home: [1,'d1fa2a12'],
  ending: [7,'b2ad8a48']
};
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,'0');};
const countLines=s=>(s.match(/\['[aiv]',/g)||[]).length;
// Текст ESM не выполняем: удаляем только import/export и проверяем синтаксис V8.
function assertSyntax(source, filename) {
  const body=source.replace(/^import[^\n]*;\s*$/gm,'').replace(/^export (?=(?:const|function|class)\b)/gm,'');
  try {new vm.Script(body,{filename});} catch(e) {throw Error('Синтаксис '+filename+': '+e.message);}
}
export function inventory(input){
  const {dialogue,game,chapter2,ui,girl,audio,adapter,playthrough,strategy}=input;
  assertSyntax(game,'game.js');
  assertSyntax(chapter2,'chapter2.js');
  const section=dialogue.split('export const SCRIPT = {')[1]?.split('\n};')[0];
  if(!section)throw Error('SCRIPT отсутствует');
  const matches=[...section.matchAll(/^  ([\w]+): \[/gm)];
  const entries=Object.fromEntries(matches.map((m,i)=>{
    const body=section.slice(m.index+2,i+1<matches.length?matches[i+1].index:section.length).trim().replace(/,\s*$/,'');
    return [m[1],{lines:countLines(body),hash:hash(body)}];
  }));
  for(const [key,[lines,checksum]] of Object.entries(baseline)){
    if(!entries[key]||entries[key].lines!==lines||entries[key].hash!==checksum)
      throw Error('Утеряна или изменена реплика главы I: '+key);
  }
  const barks=dialogue.split('export const CHASE_BARKS = [')[1]?.split('\n];')[0]??'';
  if(countLines(barks)!==5)throw Error('Потеряны реплики погони');
  for(const key of ['archiveIntro','archive1','archive2','archive3','archiveDoorHint','doorShut','archiveCaught','archiveWhisper','archiveReveal'])
    if(!entries[key])throw Error('Не хватает диалога главы II: '+key);
  const buttons=[...ui.matchAll(/<button\b[^>]*>/g)].map(m=>m[0]);
  for(const marker of ['id="ap-menu-btn"','id="ap-act"','data-m="resume"','data-m="sound"','data-m="restart"','data-m="start"','id="ap-next"'])
    if(!buttons.some(b=>b.includes(marker)))throw Error('Утеряна кнопка: '+marker);
  if(buttons.length<8)throw Error('Кнопок меньше 8');
  const modes=['follow','listen','tell','chase','lunge','grab','stun','sleep','rise','faint','idle'];
  for(const mode of modes)if(!girl.includes("'"+mode+"'"))throw Error('Утеряна анимация Ивы: '+mode);
  if(!girl.includes("'sleepwalk'"))throw Error('Нет анимации главы II');
  const sounds=['setEnabled','setMood','setLevels','chime','dust','stab','door','step','voice'];
  for(const name of sounds)if(!new RegExp('\\b'+name+'\\s*\\(').test(audio))throw Error('Утерян звук: '+name);
  for(const marker of ['const herbs = SPOTS.herbs.map','const shrooms = SPOTS.shrooms.map',
    'const spares = SPOTS.spare.map','const waterBeacon = beacon','const homeBeacon = beacon',
    'function startChase()','function toEnding(', 'debugChase()', 'get caughtCount()'])
      if(!game.includes(marker))throw Error('Утеряна механика главы I: '+marker);
  if(!adapter.includes('Object.freeze')||!adapter.includes('levels: 4'))
    throw Error('Ручка META BOT незащищена либо потеряла уровни');
  if(!game.includes('get chapter1CardReady()')||!adapter.includes('ap.chapter1CardReady')||!strategy.includes('ctx.state().chapter1CardReady'))
    throw Error('Переход между главами не привязан к готовой карточке');
  const botBody=game.split('function botInput(dt) {')[1]?.split('// ---------- Симуляция')[0];
  if(!botBody)throw Error('Бот главы I не найден');
  if(/\bchapter2\s*(?:\.\s*(?:action|botActionIfNear)\s*\(|\[)/.test(botBody.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,'')))
    throw Error('Бот закрывает дверь без физического ввода');
  const verdict=playthrough.split('const pass=')[1]?.split('console.log')[0];
  if(!verdict)throw Error('Нет проверки браузерного бота');
  const captureLimit=verdict.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,'').match(/last\.archiveCaught\s*<=\s*(\d+)/);
  if(!captureLimit||Number(captureLimit[1])>8)throw Error('Превышен лимит поимок в боте');
  return {chapter1ScriptKeys:Object.keys(baseline).length,chapter1ScriptLines:Object.values(baseline).reduce((a,b)=>a+b[0],0),
    allScriptKeys:Object.keys(entries).length,allScriptLines:Object.values(entries).reduce((a,b)=>a+b.lines,0),
    originalChaseLines:5,chapter1Collectibles:{herbs:3,shrooms:2,spareShrooms:5,water:1},
    chapter1Actors:3,ivaModesOriginal:modes.length,soundMethodsOriginal:sounds.length,
    buttonElements:buttons.length,chapter1ButtonElements:7};
}
export function sourceInput(){return {
  dialogue:read('dialogue.js'),game:read('game.js'),chapter2:read('chapter2.js'),ui:read('ui.js'),
  girl:read('girl.js'),audio:read('audio.js'),adapter:read('bot-adapter.js'),
  playthrough:read('bot/playthrough.mjs'),strategy:read('bot-strategy.mjs')
};}
console.log(JSON.stringify(inventory(sourceInput()),null,2));
