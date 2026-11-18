// Ловушки и мутанты ASSET GUARD: каждый закон ловит свой плохой PR; выключенный закон обязан ронять ловушку.
import {check, RULES, baseSlug} from './rules.mjs';
const PNG = {changed: true, isPng: true, bytes: 150000};
const good = {branch: 'lab/assets-last-healer-video', files: [
  'asset-packs/incoming/last-healer-video/makers.js', 'asset-packs/incoming/last-healer-video/_check/compare.png',
  'reports/asset-pack-bot/last-healer-video.md'], otherBranches: ['lab/assets-black-train', 'lab/z01-x'], compare: PNG};
const traps = [
  ['branch-name', {...good, branch: 'lab/assets-last-healer-video-20261117-gpt6', otherBranches: []}],
  ['branch-name', {...good, branch: 'lab/healer-batch', otherBranches: []}],
  ['only-own-pack', {...good, files: [...good.files, 'automation/asset-check/SPEC.md']}],
  ['only-own-pack', {...good, files: [...good.files, 'asset-packs/incoming/black-train/index.html']}],
  ['bot-no-packs', {...good, branch: 'lab/asset-bot-similarity', files: ['automation/asset-check/kinds/x.py', 'asset-packs/incoming/a/index.html']}],
  ['no-duplicate', {...good, otherBranches: ['lab/assets-last-healer-video-batch2-20261117-g6']}],
  ['compare-png', {...good, compare: {changed: false}}],
  ['compare-png', {...good, compare: {changed: true, isPng: false, bytes: 90000}}],
  ['compare-png', {...good, compare: {changed: true, isPng: true, bytes: 900}}],
];
let fail = 0;
const t = (ok, msg) => { if (!ok) { fail++; console.error('FAIL ' + msg); } else console.log('ok   ' + msg); };
t(check(good).length === 0, 'чистый PR игры проходит');
t(check({...good, files: ['asset-packs/incoming/last-healer-video/ZAKAZ.json'], compare: {}}).length === 0, 'PR только с ZAKAZ.json не требует compare.png');
t(check({branch: 'lab/asset-bot-similarity', files: ['automation/asset-check/kinds/x.py', 'OSHIBKI.md']}).length === 0, 'чистый PR бота проходит');
t(check({branch: 'claude/fix', files: ['asset-packs/incoming/a/x.js', 'OSHIBKI.md']}).length === 0, 'ветки Claude не блокируются');
t(baseSlug('last-healer-video-batch1-20261117-g6') === 'last-healer-video', 'baseSlug снимает дату и суффиксы');
for (const [rule, pr] of traps) t(check(pr).length > 0, `ловушка ${rule}: ${pr.branch}`);
for (const rule of RULES) {
  const caught = traps.filter(([r]) => r === rule).some(([, pr]) => check({...pr, off: new Set([rule])}).length === 0);
  t(caught, `мутант «выключен ${rule}» пойман`);
}
console.log(fail ? `\n${fail} провалов` : `\nвсе ловушки и ${RULES.length}/${RULES.length} мутантов пойманы`);
process.exit(fail ? 1 : 0);
