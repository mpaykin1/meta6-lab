'use strict';
const assert = require('node:assert/strict');
const {allowLocalGamePermission: allow} = require('../desktop/permissions.cjs');
const pages = [
  'app://meta-games/observer-world-en-v7/',
  'app://meta-games/games/veil-terraces/',
  'app://meta-games/games/veil-terraces/index.html'
];
for (const page of pages) {
  assert.equal(allow(page,page,'fullscreen'),true,'fullscreen '+page);
  assert.equal(allow(page,page,'pointerLock'),true,'pointer '+page);
  for(const forbidden of ['media','geolocation','notifications','openExternal'])
    assert.equal(allow(page,page,forbidden),false,'forbidden '+forbidden);
  assert.equal(allow(page,'https://malicious.example/embed','fullscreen'),false);
  assert.equal(allow(page,'app://another-host/games/veil-terraces/','fullscreen'),false);
}
for(const u of ['https://example.com/games/','app://meta-games/','file:///games/x.html'])
  assert.equal(allow(u,u,'fullscreen'),false);
console.log('Local directory game fullscreen and pointer capture PASS');
