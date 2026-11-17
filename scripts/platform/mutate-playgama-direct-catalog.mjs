import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const path=fileURLToPath(new URL('../../rules/09-platforma/KATALOG_META_GAMES_PLAYGAMA.md',import.meta.url));
function verify(source){
  const clean=source.replace(/<!--[\s\S]*?-->/g,'');
  assert.match(clean,/Нажатие на \*\*обложку, название или кнопку «Играть»\*\* каждой игры сразу открывает/,'Нет прямого открытия');
  assert.match(clean,/Все три ссылки одной карточки ведут на \*\*один и тот же URL\*\*/,'URL карточки расходятся');
  assert.match(clean,/\*\*Запрещены промежуточные страницы:\*\*/,'Разрешена страница-посредник');
  assert.match(clean,/обновить все 8 главных страниц в одной задаче/,'Локали расходятся');
}
const original=readFileSync(path,'utf8');
verify(original);
const mutants=[
 ['разные ссылки',original.replace('Все три ссылки одной карточки ведут на **один и тот же URL**','Все три ссылки одной карточки ведут на разные URL')],
 ['посредник вместо игры',original.replace('**Запрещены промежуточные страницы:**','**Разрешены промежуточные страницы:**')],
 ['обман комментарием',original.replace('обновить все 8 главных страниц в одной задаче','обновить только английскую страницу')+'\n<!-- обновить все 8 главных страниц в одной задаче -->']
];
for(const [name,mutant] of mutants){
 assert.notEqual(mutant,original,name+': мутация не создана');
 assert.throws(()=>verify(mutant),undefined,name+': пропущенная мутация');
}
console.log('Playgama catalog direct links: PASS; 3 мутации пойманы');
