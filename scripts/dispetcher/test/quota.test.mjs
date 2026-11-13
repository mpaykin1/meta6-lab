import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const target = process.env.DISPATCHER_QUOTA_MODULE ||
  new URL('../quota.mjs', import.meta.url).href;
const {dispatcherQuotaFallback} = await import(target.startsWith('file:')
  ? target : pathToFileURL(target).href);
test('quota 403 preserves known truthful queue', () => {
  assert.equal(dispatcherQuotaFallback(Error('/pulls/258: 403 API rate limit exceeded for installation'), true), true);
});
test('quota 429 preserves known truthful queue', () => {
  assert.equal(dispatcherQuotaFallback(Error('HTTP 429'), true), true);
});
test('never hide permission errors behind preserved queue', () => {
  assert.equal(dispatcherQuotaFallback(Error('403 Resource not accessible by integration'), true), false);
});
test('never claim a good snapshot if there is none', () => {
  assert.equal(dispatcherQuotaFallback(Error('429 rate limit exceeded'), false), false);
});
test('ordinary programming errors remain failures', () => {
  assert.equal(dispatcherQuotaFallback(new TypeError('Cannot read properties of undefined'), true), false);
});
