import {test, expect} from '@playwright/test';

const snapshot = page => page.evaluate(() => window.__MGF_STATE__?.() ?? null);
const ready = async page => {
  const fatal=[];
  page.on('pageerror', e=>fatal.push(String(e.message||e)));
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await expect.poll(async()=> (await snapshot(page))?.ready,{timeout:30000}).toBe(true);
  await expect(page.locator('#world')).toBeVisible();
  await expect(page.locator('#veil')).toHaveCount(0,{timeout:10000});
  return fatal;
};
const moved = (a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

test('render and inaction invariants', async({page})=>{
  const fatal=await ready(page);
  const first=await snapshot(page);
  expect(first.actorCount).toBe(1);
  expect(first.node).toBeTruthy();
  await page.waitForTimeout(650);
  const next=await snapshot(page);
  expect(moved(first.player,next.player)).toBeLessThan(0.05);
  expect(next.actorCount).toBe(1);
  expect(next.node).toBe(first.node);
  expect(fatal).toEqual([]);
});

test('actual player movement, jump and identity preservation',async({page,isMobile})=>{
  test.skip(isMobile,'Movement on touch devices is exercised in mobile suite');
  await ready(page);
  const initial=await snapshot(page);
  await page.keyboard.down('w');
  await expect.poll(async()=> (await snapshot(page)).player.z, {timeout:6000})
    .toBeLessThan(initial.player.z-1);
  await page.keyboard.up('w');
  const after=await snapshot(page);
  expect(after.actorCount).toBe(1);
  await page.keyboard.press('Space');
  await expect.poll(async()=> (await snapshot(page)).player.y,{timeout:4000})
    .toBeGreaterThan(after.player.y+0.13);
  await expect.poll(async()=> (await snapshot(page)).player.grounded,{timeout:6000}).toBe(true);
  expect((await snapshot(page)).actorCount).toBe(1);
});

test('graphics presets do not modify character or physics',async({page})=>{
  await ready(page);
  const before=await snapshot(page);
  await page.locator('#style').click();
  await expect.poll(async()=> (await snapshot(page)).style).not.toBe(before.style);
  await page.locator('#quality').click();
  const after=await snapshot(page);
  expect(after.quality).not.toBe(before.quality);
  expect(after.actorCount).toBe(1);
  expect(moved(before.player,after.player)).toBeLessThan(0.10);
});

test('save and load restores real physics position',async({page,isMobile})=>{
  test.skip(isMobile,'Controlled keyboard restoration check on desktop');
  await ready(page);
  await page.keyboard.down('w');await page.waitForTimeout(450);await page.keyboard.up('w');
  await page.locator('#save').click();
  const stored=await snapshot(page);
  await page.keyboard.down('w');await page.waitForTimeout(550);await page.keyboard.up('w');
  const movedState=await snapshot(page);
  expect(moved(stored.player,movedState.player)).toBeGreaterThan(1);
  await page.locator('#load').click();
  await expect.poll(async()=>moved(stored.player,(await snapshot(page)).player),{timeout:4000}).toBeLessThan(.2);
});

test('Ink choice drives graph ending, no fabricated transitions',async({page,isMobile})=>{
  test.skip(isMobile,'Long-path story verification uses keyboard controls');
  await ready(page);
  await page.keyboard.down('w');
  await expect.poll(async()=> (await snapshot(page)).player.z,{timeout:9000}).toBeLessThan(-7.9);
  await page.keyboard.up('w');
  await expect(page.locator('#prompt')).toBeVisible({timeout:5000});
  await page.keyboard.press('e');
  await expect(page.locator('#story')).toBeVisible({timeout:5000});
  await expect(page.locator('#choices button')).toHaveCount(2);
  await page.locator('#choices button').first().click();
  await expect(page.locator('#choices button')).toHaveCount(2);
  await page.locator('#choices button').first().click();
  await expect(page.locator('#storyNext')).toBeVisible();
  await page.locator('#storyNext').click();
  await expect(page.locator('#ending')).toBeVisible();
  await expect(page.locator('#endingTitle')).toContainText('Свет');
  expect((await snapshot(page)).actorCount).toBe(1);
});

test('Recast navmesh scout has path target and stays independent',async({page})=>{
  await ready(page);
  const s=await snapshot(page);
  expect(s.nav.ready,'Recast NavMesh failed initialization').toBe(true);
  expect(s.npc,'NPC must have real Rapier position').not.toBeNull();
  expect(s.nav.target,'NavMesh target must be taken from Rete scene marker').toBe(s.node);
  const originalPos=s.player;
  await page.locator('#nav').click();
  await expect(page.locator('#message')).toContainText('NavMesh:');
  expect(moved(originalPos,(await snapshot(page)).player)).toBeLessThan(.08);
});

test('mobile touch controls and visual controls',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile only');
  await ready(page);
  const start=await snapshot(page);
  const forward=page.locator('.touch [data-key="w"]');
  await expect(forward).toBeVisible();
  // Real screen pointer interaction; does not inject state or bypass controller.
  const rect=await forward.boundingBox();
  expect(rect).not.toBeNull();
  await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
  await page.mouse.down();await page.waitForTimeout(800);await page.mouse.up();
  await expect.poll(async()=>moved(start.player,(await snapshot(page)).player),{timeout:3000}).toBeGreaterThan(.2);
  await page.locator('#style').click();
  expect((await snapshot(page)).style).not.toBe(start.style);
  expect((await snapshot(page)).actorCount).toBe(1);
});
