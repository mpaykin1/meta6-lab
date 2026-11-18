// Ловушки и мутанты ASSET GUARD: каждый закон ловит свой плохой PR; выключенный закон обязан ронять ловушку.
import {check, RULES, SHEET_RULES, sheetVerdict, baseSlug} from './rules.mjs';
const good = {branch: 'lab/assets-last-healer-video', files: [
  'asset-packs/incoming/last-healer-video/makers.js', 'asset-packs/incoming/last-healer-video/_check/compare.png',
  'reports/asset-pack-bot/last-healer-video.md'], otherBranches: ['lab/assets-black-train', 'lab/z01-x']};
const traps = [
  ['branch-name', {...good, branch: 'lab/assets-last-healer-video-20261117-gpt6', otherBranches: []}],
  ['branch-name', {...good, branch: 'lab/healer-batch', otherBranches: []}],
  ['only-own-pack', {...good, files: [...good.files, 'automation/asset-check/SPEC.md']}],
  ['only-own-pack', {...good, files: [...good.files, 'asset-packs/incoming/black-train/index.html']}],
  ['bot-no-packs', {...good, branch: 'lab/asset-bot-similarity', files: ['automation/asset-check/kinds/x.py', 'asset-packs/incoming/a/index.html']}],
  ['no-duplicate', {...good, otherBranches: ['lab/assets-last-healer-video-batch2-20261117-g6']}],
];
let fail = 0;
const t = (ok, msg) => { if (!ok) { fail++; console.error('FAIL ' + msg); } else console.log('ok   ' + msg); };
t(check(good).length === 0, 'чистый PR игры проходит');
t(check({branch: 'lab/asset-bot-similarity', files: ['automation/asset-check/kinds/x.py', 'OSHIBKI.md']}).length === 0, 'чистый PR бота проходит');
t(check({branch: 'claude/fix', files: ['asset-packs/incoming/a/x.js', 'OSHIBKI.md']}).length === 0, 'ветки Claude не блокируются');
t(baseSlug('last-healer-video-batch1-20261117-g6') === 'last-healer-video', 'baseSlug снимает дату и суффиксы');
for (const [rule, pr] of traps) t(check(pr).length > 0, `ловушка ${rule}: ${pr.branch}`);
for (const rule of RULES) {
  const caught = traps.filter(([r]) => r === rule).some(([, pr]) => check({...pr, off: new Set([rule])}).length === 0);
  t(caught, `мутант «выключен ${rule}» пойман`);
}
// лист сравнения (CI)
const okSheet = {ok: true, items: [{id: 'a', visible: true}, {id: 'sndRain', visible: false, audio: true}]};
const sheetTraps = [
  ['sheet-built', {ok: false, items: [], errors: ['нет window.__ISOLATE__']}],
  ['sheet-built', {ok: true, items: [{id: 'snd', audio: true, visible: false}]}],
  ['sheet-visible', {ok: true, items: [{id: 'a', visible: true}, {id: 'roof', visible: false}]}],
];
t(sheetVerdict(okSheet).length === 0, 'хороший лист проходит (звук не обязан быть видимым)');
for (const [rule, rep] of sheetTraps) t(sheetVerdict(rep).length > 0, `ловушка листа ${rule}`);
for (const rule of SHEET_RULES)
  t(sheetTraps.filter(([r]) => r === rule).some(([, rep]) => sheetVerdict(rep, new Set([rule])).length === 0), `мутант «выключен ${rule}» пойман`);
console.log(fail ? `\n${fail} провалов` : `\nвсе ловушки и ${RULES.length + SHEET_RULES.length}/${RULES.length + SHEET_RULES.length} мутантов пойманы`);
process.exit(fail ? 1 : 0);
