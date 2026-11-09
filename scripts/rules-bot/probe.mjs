// B6: browser-only evidence; META BOT server is imported, never changed.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {serve} from '../meta-bot/server.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const screens=[
 {name:'телефон 390×844',viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2},
 {name:'ПК 1280×720',viewport:{width:1280,height:720},hasTouch:false,isMobile:false,deviceScaleFactor:1}
];
function installCapture(){
 const edges=[],text=[];
 const connect=AudioNode.prototype.connect;
 AudioNode.prototype.connect=function(...args){edges.push([this,args[0]]);return connect.apply(this,args);};
 for(const method of ['fillText','strokeText']){
  const before=CanvasRenderingContext2D.prototype[method];
  CanvasRenderingContext2D.prototype[method]=function(...args){
   text.push({label:String(args[0]),time:performance.now()});return before.apply(this,args);
  };
 }
 Object.defineProperty(window,'__RULES_CAPTURE__',{value:{edges,text},writable:false});
}
export async function auditGame({gameDir,rules}){
 const server=await serve(root);
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
 const records=[];
 try {
  for(const screen of screens){
   const context=await browser.newContext({viewport:screen.viewport,hasTouch:screen.hasTouch,isMobile:screen.isMobile,deviceScaleFactor:screen.deviceScaleFactor});
   await context.addInitScript(installCapture);
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
   try {
    const relative=path.relative(root,gameDir).split(path.sep).join('/');
    const url=new URL(relative+'/index.html',server.url+'/');
    const response=await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
    if(!response || response.status()!==200)throw Error('HTTP '+(response?.status()??'нет ответа'));
    await page.waitForSelector('canvas',{state:'visible',timeout:30000});
    await page.waitForTimeout(1800);
    if(screen.hasTouch)await page.touchscreen.tap(190,360);
    else await page.mouse.click(550,360);
    await page.waitForTimeout(1500);
    for(const rule of rules){
     let result;
     try{
      result=await rule.check({page,screen:screen.name});
      if(!['ВЫПОЛНЕНО','НАРУШЕНО','НЕ ПРИМЕНИМО'].includes(result?.status)||!result.reason)throw Error('Нет статуса или причины');
     }catch(err){result={status:'НАРУШЕНО',reason:'Проверка не смогла подтвердить поведение: '+err.message};}
     if(errors.length)result={status:'НАРУШЕНО',reason:'Ошибка браузера: '+errors.slice(0,3).join(' / ')+'; '+result.reason};
     records.push({rule:rule.id,title:rule.title,screen:screen.name,...result});
    }
   }catch(err){
    for(const rule of rules)records.push({rule:rule.id,title:rule.title,screen:screen.name,status:'НАРУШЕНО',reason:'Игра не запустилась: '+err.message});
   }finally{await context.close();}
  }
 }finally{await browser.close();server.close();}
 return records;
}