import fs from 'node:fs';
import path from 'node:path';

const STEP_NAMES = ['ИСХОДНИК', 'ОПИСЬ', 'ПРОИСХОЖДЕНИЕ', 'СИСТЕМЫ', 'АССЕТЫ', 'MCP', 'ИНДЕКС'];
const fail = message => { throw new Error('BIBLIOTEKA CONTRACT INVALID: ' + message); };

export function verifyBibliotekaContract(root, promptOverride, progressOverride) {
  const prompt = promptOverride ?? fs.readFileSync(
    path.join(root, 'automation/prompts/BIBLIOTEKA.md'), 'utf8');
  const progress = progressOverride ?? fs.readFileSync(
    path.join(root, 'automation/biblioteka/PROGRESS.md'), 'utf8');

  for (const [index, name] of STEP_NAMES.entries()) {
    const matches = [...prompt.matchAll(new RegExp('^' + (index + 1) + '\\. ' + name + '\\.', 'gm'))];
    if (matches.length !== 1) fail('missing or duplicated step ' + (index + 1) + ' ' + name);
  }

  const steps = prompt.split('\n').filter(line => /^[1-7]\. [A-ZА-ЯЁ]+\./.test(line));
  if (steps.length !== STEP_NAMES.length) fail('unexpected game step count');

  const systems = prompt.split('\n').find(line => /^4\. СИСТЕМЫ\./.test(line)) ?? '';
  if (!systems.includes('Chromium-контекст') ||
      !systems.includes('непустым canvas') ||
      !systems.includes('подтверждает load_ok') ||
      /(?:по наличию файла|без Chromium|без проверки|фиктивный PASS)/i.test(systems)) {
    fail('load_ok is not tied to independent runtime evidence');
  }

  const provenance = prompt.split('\n').find(line => /^3\. ПРОИСХОЖДЕНИЕ\./.test(line)) ?? '';
  if (!provenance.includes('источник и лицензию') ||
      !provenance.includes('права на переиспользование не подтверждены') ||
      !provenance.includes('НЕ допускать компонент в живой каталог') ||
      /лицензи[яю] подтвержда(?:ется|ть) по имени файла/i.test(provenance)) {
    fail('third-party origin and license must be verified before catalog admission');
  }

  const assets = prompt.split('\n').find(line => /^5\. АССЕТЫ\./.test(line)) ?? '';
  if (!assets.includes('asset_ok') || !assets.includes('независимой загрузки')) {
    fail('asset_ok has no independent loading gate');
  }

  if (!prompt.includes('STOROZHA PR quota') || !prompt.includes('не создавать PR') || !prompt.includes('LIVE>5')) fail('missing active-PR quota preflight');

  const required = ['*-copy', 'skin-trainer', 'PROGRESS.md', 'DLYA_CLAUDE.md',
    'MCP', 'SHA', 'двух попыток', 'main', 'Ждёт Claude', 'не доказательство'];
  for (const token of required) {
    if (!prompt.includes(token)) fail('required policy absent: ' + token);
  }

  if (!progress.includes('## Пары «игра × шаг»') ||
      !progress.includes('## Счётчик: было → стало') ||
      !progress.includes('## Список саморазвития') ||
      !progress.includes('## Урок') ||
      !progress.includes('## Развитие')) {
    fail('resumable progress structure missing');
  }
  for (const tag of ['а)', 'б)', 'в)', 'г)', 'д)', 'е)']) {
    if (!progress.includes(tag)) fail('self-development item missing: ' + tag);
  }
  return { game_steps: STEP_NAMES.length, development_items: 6 };
}
