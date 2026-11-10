#!/usr/bin/env node
// META GAMES: проверяем проводку Actions, не подменяя настоящие проверки PNG/Chrome.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function validateWorkflow(text) {
  const problems=[];
  const requireText=(needle,reason)=>{if(!text.includes(needle))problems.push(reason);};
  requireText("branches: ['lab/skin-*']", 'запуск не охватывает остальные ветки скинов');
  for(const ext of ['png','md'])
    requireText("'skins/sources/*/parts-sheet."+ext+"'",'нет trigger для parts-sheet.'+ext);
  requireText('for src in skins/sources/*; do','жёстко задан один скин вместо каталога источников');
  requireText('if ! test -f "$src/parts-sheet.png" || ! test -f "$src/parts-sheet.md"','не проверяется полнота пары лист + таблица');
  requireText('set -euo pipefail','ошибки shell могут быть скрыты');
  for(const [script,flag] of [
    ['cut-sheet.mjs','--verify'],
    ['preview.mjs','--verify'],
    ['build-pack.mjs','--finalize']
  ]) {
    const line='while IFS= read -r src; do node scripts/skins/'+script+
      ' "$src" '+flag+'; done < "$RUNNER_TEMP/skin-sources.txt"';
    requireText(line,'флаг '+flag+' у '+script+' вне цикла: shell не исполнит проверку');
  }
  for(const script of ['cut-sheet.mjs','build-pack.mjs','preview.mjs']) {
    requireText('node scripts/skins/'+script+' "$src"','не вызывается настоящий '+script);
    requireText('node scripts/skins/mutate-'+script+' "$src"','отключены ловушки для '+script);
  }
  requireText('git push origin HEAD:"$GITHUB_REF_NAME"','публикация должна писать в ту же ветку PR');
  requireText("startsWith(github.ref, 'refs/heads/lab/skin-')",'публикация не защищена от записи в main');
  requireText('git add skins/packs/ skins/sources/*/cut-preview.png skins/sources/*/side-by-side.png',
    'публикуются старые или только фиксированные файлы вместо текущих пакетов');
  requireText("const ok = '${{ job.status }}' === 'success';",
    'PR-комментарий сообщает зелёный статус без подтверждения job');
  requireText("if: ${{ always() && github.event_name == 'push' && startsWith(github.ref, 'refs/heads/lab/skin-') }}",
    'нет комментария PR при красном прогоне');
  if(/git push[^\n]*HEAD:(?:refs\/heads\/)?main\b/.test(text))problems.push('ЗАПРЕТ: пуш в main');
  if(problems.length)throw new Error('WORKFLOW СКИНОВ: '+problems.join('; '));
  return true;
}

const self=fileURLToPath(import.meta.url);
if(process.argv[1] && path.resolve(process.argv[1])===self){
  try{
    validateWorkflow(fs.readFileSync(process.argv[2]||'.github/workflows/skin-factory.yml','utf8'));
    console.log('WORKFLOW СКИНОВ: источники, ловушки, флаги и публикация в ветку PR верны');
  }catch(error){console.error(error.message);process.exitCode=1;}
}
