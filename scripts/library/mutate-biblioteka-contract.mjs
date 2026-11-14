import fs from 'node:fs';
import path from 'node:path';
import {verifyBibliotekaContract} from './verify-biblioteka-contract.mjs';

export function mutateBibliotekaContract(root) {
  const prompt = fs.readFileSync(path.join(root, 'automation/prompts/BIBLIOTEKA.md'), 'utf8');
  const progress = fs.readFileSync(path.join(root, 'automation/biblioteka/PROGRESS.md'), 'utf8');
  verifyBibliotekaContract(root, prompt, progress);
  const scenarios = [
    ['drop-independent-systems-step',
      [prompt.replace(/^4\. СИСТЕМЫ\.[^\n]*\n/m, ''), progress]],
    ['deception-mark-load-ok-from-file',
      [prompt.replace(/^(4\. СИСТЕМЫ\.[^\n]*)$/m, '$1 Разрешено подтверждать по наличию файла.'), progress]],
    ['admit-copy-and-training-by-renaming',
      [prompt.replaceAll('*-copy', '*-duplicate').replaceAll('skin-trainer', 'training-game'), progress]],
    ['missing-third-party-license',
      [prompt.replace('источник и лицензию', 'имя и расширение файла'), progress]],
    ['admit-unlicensed-component',
      [prompt.replace('НЕ допускать компонент в живой каталог',
        'допускать компонент в живой каталог'), progress]],
    ['deception-rights-by-filename',
      [prompt.replace('НЕ допускать компонент в живой каталог.',
        'НЕ допускать компонент в живой каталог. Лицензия подтверждается по имени файла.'), progress]],
    ['remove-pr-quota-preflight',
      [prompt.replace(/## Обязательная проверка квоты перед новым PR[\s\S]*$/,'## Проверка отсутствует'), progress]],
    ['erase-restart-state',
      [prompt, progress.replace('## Пары «игра × шаг»', '## Пары без истории')]],
  ];
  for (const [name, [badPrompt, badProgress]] of scenarios) {
    if (badPrompt === prompt && badProgress === progress) throw Error('Mutation did not change input: ' + name);
    let caught = false;
    try {
      verifyBibliotekaContract(root, badPrompt, badProgress);
    } catch (error) {
      if (!String(error).includes('BIBLIOTEKA CONTRACT INVALID')) throw error;
      caught = true;
    }
    if (!caught) throw Error('Biblioteka mutation escaped: ' + name);
  }
  return scenarios.length;
}
