export const id='01-clean-screen';
export const title='ЧИСТЫЙ ЭКРАН (01)';
async function observe(page){
 return page.evaluate(()=>{
  const visible=el=>{
   if(!el||!el.isConnected||el.closest('script,style,template,noscript'))return false;
   const css=getComputedStyle(el);
   if(css.display==='none'||css.visibility==='hidden')return false;
   let opacity=1;
   for(let e=el;e;e=e.parentElement)opacity*=Number(getComputedStyle(e).opacity||1);
   if(opacity<.05)return false;
   const r=el.getBoundingClientRect();
   return r.width>1&&r.height>1&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight;
  };
  const labels=[];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  for(let n=walker.nextNode();n;n=walker.nextNode()){
   const t=n.textContent.trim();
   if(!/[\p{L}\p{N}]/u.test(t)||!visible(n.parentElement))continue;
   if(n.parentElement.closest('#menu,#story'))continue;
   const range=document.createRange();range.selectNodeContents(n);const b=range.getBoundingClientRect();
   if(b.width>1&&b.height>1&&b.right>0&&b.bottom>0)labels.push(t.slice(0,80));
  }
  // CSS pseudo-content is visible lettering even when there is no text node.
  for(const el of document.querySelectorAll('body,body *')){
   if(!visible(el)||el.closest('#menu,#story'))continue;
   for(const pseudo of ['::before','::after']){
    const css=getComputedStyle(el,pseudo);
    const c=css.content;
    if(css.display!=='none'&&css.visibility!=='hidden'&&css.opacity!=='0'&&c&&c!=='none'&&c!=='normal'&&/[\p{L}\p{N}]/u.test(c)&&!/^url\(/i.test(c)){
     labels.push('CSS '+el.tagName.toLowerCase()+pseudo+': '+c.slice(0,50));
    }
   }
  }
  const buttons=[...document.querySelectorAll('button,[role="button"]')].filter(visible);
  const unlabeled=buttons.filter(el=>!(el.getAttribute('aria-label')||'').trim()).map(el=>'#'+(el.id||el.outerHTML.slice(0,30)));
  const menu=buttons.some(el=>{
   const b=el.getBoundingClientRect();
   return /меню|menu/i.test(el.getAttribute('aria-label')||'')&&b.x+b.width/2>innerWidth*.6&&b.y+b.height/2<innerHeight*.3;
  });
  const canvasText=(window.__RULES_CAPTURE__?.text||[]).filter(x=>/[\p{L}\p{N}]/u.test(x.label)).slice(-10);
  return {labels:[...new Set(labels)],unlabeled,menu,canvasText};
 });
}
export async function check({page}){
 const a=await observe(page);
 await page.waitForTimeout(3300);
 const b=await observe(page);
 await page.waitForTimeout(3300);
 const c=await observe(page);
 const stable=a.labels.filter(t=>b.labels.includes(t)&&c.labels.includes(t));
 if(!c.menu)return {status:'НАРУШЕНО',reason:'Нет видимой кнопки меню в правом верхнем углу'};
 if(c.unlabeled.length)return {status:'НАРУШЕНО',reason:'Видимые кнопки без aria-label: '+c.unlabeled.join(', ')};
 if(stable.length)return {status:'НАРУШЕНО',reason:'Постоянный текст вне меню: '+stable.join('; ')};
 if(c.canvasText.length)return {status:'НАРУШЕНО',reason:'Буквы или цифры нарисованы на canvas: '+c.canvasText.map(x=>x.label).join('; ')};
 return {status:'ВЫПОЛНЕНО',reason:'Меню справа сверху; все видимые кнопки подписаны для доступности; постоянного текста нет, краткие реплики исчезают'};
}