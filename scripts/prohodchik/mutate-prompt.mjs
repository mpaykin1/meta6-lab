// The repeatable bot prompt is executable policy: regressions in its guardrails must fail CI.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const prompt = readFileSync(root + '/automation/prompts/PROHODCHIK.md', 'utf8');

function verify(value) {
  const rules = [
    [/automation\/prohodchik\/PROGRESS\.md/, 'resume from persistent progress'],
    [/B2\s*→\s*B3\s*→\s*B4\s*→\s*B5/, 'finish order'],
    [/не менее трёх мутаций/, 'minimum three mutations'],
    [/Никаких телепортов/, 'ban cheating'],
    [/2000 мс/, '2 second stall deadline'],
    [/Максимум \*\*2 попытки\*\*/, 'maximum two repair attempts'],
    [/FINISH\.md меняет только Claude/, 'Claude owns finish statuses'],
    [/Actions run/, 'real GitHub Actions proof'],
    [/ZADACHI\.md/, 'task registration'],
    [/ZANYATO\.md/, 'claim registration'],
    [/KONTUR/, 'permanent guard'],
    [/только «Осталось сделать»/, 'owner-facing report format']
  ];
  for (const [pattern, label] of rules) {
    assert.match(value, pattern, 'Prompt lost guardrail: ' + label);
  }
}

verify(prompt);
const mutations = [
  ['forget-progress', /automation\/prohodchik\/PROGRESS\.md/g, 'chat-only-memory.md'],
  ['disable-mutations', /не менее трёх мутаций/g, 'мутации не требуются'],
  ['allow-cheat', /Никаких телепортов/g, 'Телепорты допустимы'],
  ['ignore-fast-stuck', /2000 мс/g, '20000 мс'],
  ['unlimited-repair-attempts', /Максимум \*\*2 попытки\*\*/g, 'Максимум **99 попыток**'],
  ['falsify-finish', /FINISH\.md меняет только Claude/g, 'FINISH.md меняет любой агент'],
  ['no-live-proof', /Actions run/g, 'формальный локальный результат']
];

for (const [name, target, replacement] of mutations) {
  const mutant = prompt.replace(target, replacement);
  assert.notEqual(mutant, prompt, 'Mutation target missing: ' + name);
  assert.throws(() => verify(mutant), /Prompt lost guardrail/, 'Mutation escaped: ' + name);
  console.log('PROHODCHIK_PROMPT_MUTATION_PASS ' + name);
}
console.log('PROHODCHIK_PROMPT_MUTATIONS_PASS 7 including live-proof and cheating deception');
