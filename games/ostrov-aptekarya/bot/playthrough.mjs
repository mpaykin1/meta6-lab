// «Остров последнего аптекаря»: full=I→II, chapter1=сохранение I, archive=прятки,
// chase=старая погоня, passive=быть пойманным и продолжить с контрольной точки.
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const mode = process.argv[2] || 'full';
if(!['full','chapter1','archive','chase','passive'].includes(mode)) throw Error('Unknown mode: '+mode);
const url = process.env.URL || 'http://localhost:8765/games/ostrov-aptekarya/';
const browser = await chromium.launch({
  executablePath:process.env.CHROME || undefined,
  args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
});
const page = await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
const errors=[], artifacts=process.env.APTEKARYA_ARTIFACT_DIR;
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto(url);
await page.waitForFunction(()=>window.__APTEKAR__?.start,null,{timeout:60000});
await page.waitForTimeout(1500);
await page.evaluate(m=>{
  const a=window.__APTEKAR__;
  if(m==='archive')a.debugChapter2();
  else if(m==='chase'||m==='passive')a.debugChase();
  else a.start();
  a.bot=true;a.botPassive=m==='passive';a.timeScale=4;
},mode);
const stray=()=>page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>
  e.offsetParent && [...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()) &&
  !e.closest('#ap-say,#ap-menu,.ap-card')).length);
let result='TIMEOUT',strayText=0, chapter1Seen=false, archiveSeen=false, screenshots=false;
let last={};
const t0=Date.now();
while(Date.now()-t0<480000){
  last=await page.evaluate(()=>{
    const a=window.__APTEKAR__;
    return {state:a.state,chapter:a.chapter,pages:a.archivePages,doors:a.archiveDoors,
      archiveCaught:a.archiveCaught,caught:a.caughtCount,ended:a.ended,
      chapter1Ended:a.chapter1Ended,endCard:!document.getElementById('ap-end').hidden};
  });
  strayText=Math.max(strayText,await stray());
  if(last.chapter1Ended) chapter1Seen=true;
  if(last.state==='archive')archiveSeen=true;
  if(mode==='full'&&last.chapter1Ended){
    await page.locator('#ap-next').click({timeout:12000});await page.waitForTimeout(300);
  }
  if((mode==='full'||mode==='archive')&&last.state==='archive'&&last.doors===0) {
    // Взаимодействие дверью — только реальная кнопка игрока, не скрытое действие из игрового движка.
    const door = await page.evaluate(()=>{
      const a=window.__APTEKAR__,g=a.goal(),p=a.heroPos();
      return !!g?.door && Math.hypot(g.x-p.x,g.y-p.z)<1.85;
    });
    if(door)await page.locator('#ap-act').click({timeout:12000});
  }
  if(artifacts&&!screenshots&&last.state==='archive'&&last.pages>=1){
    fs.mkdirSync(artifacts,{recursive:true});
    await page.screenshot({path:path.join(artifacts,'chapter2-mobile.png')});
    await page.setViewportSize({width:1440,height:900});
    await page.waitForTimeout(500);
    await page.screenshot({path:path.join(artifacts,'chapter2-desktop.png')});
    await page.setViewportSize({width:390,height:844});
    screenshots=true;
  }
  if(mode==='passive'&&last.caught>=1&&last.state==='chase'){result='CAUGHT_AND_RETRY';break;}
  if((mode==='chapter1'||mode==='chase')&&last.chapter1Ended){result='CHAPTER_I_END';break;}
  if((mode==='full'||mode==='archive')&&last.ended&&last.endCard){result='CHAPTER_II_END';break;}
  await page.waitForTimeout(600);
}
await browser.close();
const pass=errors.length===0&&strayText===0&&(
  mode==='passive'? result==='CAUGHT_AND_RETRY':
  mode==='chase'||mode==='chapter1'?result==='CHAPTER_I_END':
  result==='CHAPTER_II_END'&&archiveSeen&&last.pages===3&&last.doors>=1&&
    (mode!=='full'||chapter1Seen)
) && (!artifacts || !['full','archive'].includes(mode) || screenshots);
console.log(JSON.stringify({mode,result,chapter1Seen,archiveSeen,screenshots,
  pages:last.pages,doors:last.doors,archiveCaught:last.archiveCaught,
  caught:last.caught,errors,strayText,pass}));
process.exit(pass?0:1);
