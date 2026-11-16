import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {routeFor} from '../route.mjs';

const map = {
  schema:1, status:'полная',
  prs:[{number:332,type:'assets',changedFiles:3}],
  metrics:[{type:'assets',actor:'автозадача',zone:'жёлтая'}]
};
const failing = {
  id:332,changedFiles:3,
  problem:'Красная проверка: Vercel (https://vercel.com/improve-world?upgradeToPro=build-rate-limit)'
};

test('Vercel build-rate-limit не выдаётся автоматическому строителю',()=>{
  const decision=routeFor(failing,map);
  assert.equal(decision.target,'chat');
  assert.equal(decision.zone,'внешняя квота');
  assert.match(decision.note,/код и проверки не менять/);
});

test('обман: обычный Vercel CI FAIL не скрывается под внешней квотой',()=>{
  const other={...failing,problem:'Красная проверка: Vercel (https://vercel.com/deployments/example)'};
  assert.equal(routeFor(other,map).target,'auto');
  for (const fake of [
    'Vercel (https://fake.vercel.com/improve-world?upgradeToPro=build-rate-limit)',
    'Vercel (https://vercel.com/improve-world?upgradeToPro=build-rate-limit-false)',
    'Vercel (https://example.org/?url=https://vercel.com/improve-world?upgradeToPro=build-rate-limit)'
  ]) assert.equal(routeFor({...failing,problem:fake},map).target,'auto',fake);
});

test('мутация: выключение фильтра снова выпускает невозможную карточку',async()=>{
  const source=await fs.readFile(new URL('../route.mjs',import.meta.url),'utf8');
  const mutant=source.replace('if (externalQuota) {','if (false) {');
  assert.notEqual(mutant,source,'мутация действительно изменила код');
  const module=await import('data:text/javascript;base64,'+Buffer.from(mutant).toString('base64'));
  assert.equal(module.routeFor(failing,map).target,'auto','мутант должен быть пойман первой проверкой');
});
