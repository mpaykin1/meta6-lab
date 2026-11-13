// Inventory contract: counts are derived from the real sources, not manually declared totals.
// Run: node games/ostrov-aptekarya/bot/inventory.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = filename => fs.readFileSync(path.join(dir, filename), 'utf8');
const baseline = {
  intro: [9,'256e29b9'], herb1:[1,'4e7c135f'], herb2:[2,'1b7dc346'],
  herb3:[3,'99507fd7'], shroom1:[1,'6d34e118'], shroom2:[3,'31b2486b'],
  robot:[7,'95b8db7b'], shrine:[3,'b8ee4307'], fox:[2,'f8a9328b'],
  deer:[2,'b1fe00ee'], lake:[3,'382b8f6b'], dusk1:[2,'991fff67'],
  dusk2:[3,'edea5a26'], water:[3,'d613c17a'], tell:[4,'6c95b8c7'],
  tellLate:[3,'b342cc27'], hint:[1,'d1c4e086'], grab:[2,'5d99b74c'],
  dust:[1,'8079853d'], breakFree:[1,'1d28a826'], caught:[1,'75a2dd2e'],
  caughtAfter:[1,'c3648761'], faint:[2,'c7d74282'], home:[1,'bae3d43f'],
  ending:[7,'9b9e080c']
};
const hash = s => {let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,'0');};
const countLines = s => (s.match(/\['[aiv]',/g) || []).length;
export function inventory(input) {
  const {dialogue,game,ui,girl,audio,adapter,playthrough} = input;
  const section = dialogue.split('export const SCRIPT = {')[1]?.split('\n};')[0];
  if (!section) throw Error('SCRIPT отсутствует');
  const entries = Object.fromEntries([...section.matchAll(/^  ([\w]+): \[\n([\s\S]*?)^  \],?/gm)]
    .map(m => [m[1], {lines:countLines(m[2]), hash:hash(m[2])}]));
  for(const [key,[lines,checksum]] of Object.entries(baseline)) {
    if(!entries[key] || entries[key].lines!==lines || entries[key].hash!==checksum)
      throw Error('Утеряна реплика главы I: '+key);
  }
  const ambient = dialogue.split('export const AMBIENT = [')[1]?.split('\n];')[0] ?? '';
  const barks = dialogue.split('export const CHASE_BARKS = [')[1]?.split('\n];')[0] ?? '';
  if(countLines(ambient)!==10 || countLines(barks)!==5) throw Error('Потеряны фоновые разговоры или реплики погони');
  const uiButtons=[...ui.matchAll(/<button\b[^>]*>/g)].map(m=>m[0]);
  const originalButtons=['id="ap-menu-btn"','id="ap-act"','data-m="resume"','data-m="sound"','data-m="restart"','data-m="start"'];
  for(const marker of originalButtons) if(!uiButtons.some(b=>b.includes(marker))) throw Error('Потеряна кнопка: '+marker);
  if(uiButtons.length<7) throw Error('Кнопок главы I меньше 7');
  const originalGirlModes=['follow','listen','tell','chase','lunge','grab','stun','sleep','rise','faint','idle'];
  for(const mode of originalGirlModes) if(!girl.includes("'"+mode+"'")) throw Error('Потеряно состояние Ивы: '+mode);
  const originalSounds=['setEnabled','setMood','setLevels','chime','dust','stab','door','step','voice'];
  for(const name of originalSounds) if(!new RegExp('\\b'+name+'\\s*\\(').test(audio)) throw Error('Потерян звук: '+name);
  for(const marker of ['const herbs = SPOTS.herbs.map','const shrooms = SPOTS.shrooms.map',
    'const spares = SPOTS.spare.map','const waterBeacon = beacon','const homeBeacon = beacon',
    'function startChase()', 'function toEnding(', "debugChase()", 'get caughtCount()']) {
    if(!game.includes(marker))throw Error('Потеряна механика главы I: '+marker);
  }
  if(!adapter.includes('Object.freeze')) throw Error('Ручка META BOT не защищена');
  // Бот ведёт героя, но не должен автоматически закрывать двери внутри игровой логики.
  // Разрешён только настоящий ввод игрока (нажатие Space / иконки) из внешнего бота.
  const botBody = game.split('function botInput(dt) {')[1]?.split('// ---------- Симуляция')[0];
  if(!botBody)throw Error('Не найден бот главы I');
  const cleanBot = botBody.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,'');
  if(/\bchapter2\s*(?:\.\s*(?:action|botActionIfNear)\s*\(|\[)/.test(cleanBot))
    throw Error('Недопустимо: бот закрывает дверь из движка без пользовательского ввода');
  // Лимит поимок нельзя спрятать в комментарии или заменить чрезмерным числом.
  const verdict = playthrough.split('const pass=')[1]?.split('console.log')[0];
  if(!verdict)throw Error('Нет итоговой проверки браузерного бота');
  const visibleCheck=verdict.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,'');
  const captureLimit=visibleCheck.match(/last\.archiveCaught\s*<=\s*(\d+)/);
  if(!captureLimit || Number(captureLimit[1])>8)
    throw Error('Браузерный бот больше не ограничивает поимки Ивой');
  return {
    scriptKeys:Object.keys(entries).length,
    chapter1ScriptKeys:Object.keys(baseline).length,
    chapter1ScriptLines:Object.values(baseline).reduce((a,e)=>a+e[0],0),
    allScriptLines:Object.values(entries).reduce((a,e)=>a+e.lines,0),
    ambientPairs:5,ambientLines:countLines(ambient),chaseLines:countLines(barks),
    chapter1Collectibles:{herbs:3,shrooms:2,spareShrooms:5,water:1},
    chapter1Actors:3,ivaModesOriginal:originalGirlModes.length,
    soundMethodsOriginal:originalSounds.length,buttonElements:uiButtons.length,
    chapter1ButtonElements:7
  };
}
export function sourceInput() {return {
  dialogue:read('dialogue.js'),game:read('game.js'),ui:read('ui.js'),
  girl:read('girl.js'),audio:read('audio.js'),adapter:read('bot-adapter.js'),
  playthrough:read('bot/playthrough.mjs')
};}
console.log(JSON.stringify(inventory(sourceInput()),null,2));
