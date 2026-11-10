import assert from 'node:assert/strict';
export function validatePortalLinks(hrefs) {
 assert.ok(hrefs.length>0,'Catalog must expose playable worlds');
 assert.ok(hrefs.every(h=>typeof h==='string' && /^\.\.\/(?:[a-z0-9][a-z0-9-]*\/)+$/.test(h)),'Invalid local world href');
 assert.equal(new Set(hrefs).size,hrefs.length,'Duplicate game links in catalog');
 assert.ok(hrefs[0].includes('observer-world-en-v7'),'First world changed; review visit target');
 return hrefs.length;
}
