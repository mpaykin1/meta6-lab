import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { assertAppendOnly } from './append-only.mjs';

const base = process.argv[2];
if (!base || !/^[a-f0-9]{40}$/.test(base)) throw Error('Expected exact baseline commit SHA');
const path = 'scripts/auditor/mutate-auditor.mjs';
const before = execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' });
assertAppendOnly(before, readFileSync(path, 'utf8'));
console.log('PASS existing auditor test retained verbatim relative to', base);
