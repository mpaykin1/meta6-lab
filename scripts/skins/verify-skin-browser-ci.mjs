#!/usr/bin/env node
// Playwright 1.56 cannot install Chromium dependencies on ubuntu26.04/ubuntu-latest.
// Pin the known supported Ubuntu 24.04 image and reject a silent return to latest.
import fs from 'node:fs';
const file=process.argv[2]||'.github/workflows/skin-pack.yml';
const text=fs.readFileSync(file,'utf8');
if(!/^\s+runs-on:\s+ubuntu-24\.04\s*$/m.test(text) || /runs-on:\s+ubuntu-latest/.test(text)){
 console.error('SKIN_CI_RUNNER: unsupported GitHub runner: Playwright requires pinned ubuntu-24.04');
 process.exit(1);
}
console.log('SKIN_CI_RUNNER PASS (ubuntu-24.04)');
