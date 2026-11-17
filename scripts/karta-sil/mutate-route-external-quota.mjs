import assert from 'node:assert/strict';
import fs from 'node:fs';
import {routeFor} from './route.mjs';

const map={schema:1,status:'полная',
  prs:[{number:332,type:'assets',changedFiles:3}],
  metrics:[{type:'assets',actor:'автозадача',zone:'жёлтая'}]};
const limited={id:332,changedFiles:3,
  problem:'Красная проверка: Vercel (https://vercel.com/improve-world?upgradeToPro=build-rate-limit)'};
const fake={...limited,
  problem:'Vercel (https://fake.vercel.com/improve-world?upgradeToPro=build-rate-limit)'};
assert.equal(routeFor(limited,map).target,'chat');
assert.equal(routeFor(fake,map).target,'auto');

const source=fs.readFileSync(new URL('./route.mjs',import.meta.url),'utf8');
const mutant=source.replace('if (externalQuota) {','if (false) {');
assert.notEqual(mutant,source,'мутация должна менять работающий фильтр');
const loaded=await import('data:text/javascript;base64,'+Buffer.from(mutant).toString('base64'));
assert.equal(loaded.routeFor(limited,map).target,'auto','мутант обязан нарушить контракт');
console.log('MUTATE_ROUTE_VERCEL_PASS: отключение фильтра поймано');
