// User-initiated descent, courtyard landing, explicit entry to Adagio.
import {Nit} from './nit.js';
import {readCourtyardStory} from './ink-courtyard.js';
import {createTransition} from './chapter-transition.js';
export function createCourtyardGate({link,fade,caption,language,onTravel,onProgress,onPrepare,onLand}){
 let unlocked=false,stage='idle',line='',request=0,p=0,deadline=0,nextTry=0;
 const motion=createTransition();
 const url=()=>{const target=new URL('../../',location.href);const token=Nit.encode();if(token)target.searchParams.set('nit',token);return target.href;};
 const ru=()=>String(language()).toLowerCase().startsWith('ru');
 const msg=(a,b)=>ru()?a:b;
 const status=document.createElement('div');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 Object.assign(status.style,{position:'fixed',right:'16px',bottom:'max(218px,calc(env(safe-area-inset-bottom) + 202px))',maxWidth:'min(260px,75vw)',padding:'8px 12px',background:'#152235e8',color:'#e9f3ff',border:'1px solid #b8d8fa80',borderRadius:'8px',font:'14px sans-serif',textAlign:'right',zIndex:'32',pointerEvents:'none'});
 status.hidden=true;document.body.append(status);
 Object.assign(link.style,{bottom:'max(152px,calc(env(safe-area-inset-bottom) + 136px))',zIndex:'32',touchAction:'manipulation'});
 function say(s){status.textContent=s;status.hidden=!s;}
 function refresh(){if(!unlocked||stage!=='idle')return;const seq=++request;readCourtyardStory(Nit.read(),language()).then(value=>{if(seq===request&&stage==='idle')line=value;});}
 function label(s){link.setAttribute('aria-label',s);}
 function begin(){
  try{if(!onTravel())return false;}catch(err){console.warn('Courtyard initialization:',err);return false;}
  stage='descending';p=0;link.hidden=true;say('');if(line)caption(line);
  motion.start(3600,()=>{stage='landed';p=1;fade.style.opacity='0';label('Enter manor / Войти в усадьбу');say(msg('Войти в усадьбу','Enter the manor'));onLand?.();});
  return true;
 }
 function activate(){
  if(stage==='landed'||stage==='failed'){stage='entering';link.hidden=true;say('');location.assign(url());return;}
  if(!unlocked||stage!=='idle')return;
  if(begin())return;
  stage='waiting';deadline=performance.now()+20000;nextTry=0;label('Loading courtyard / Загрузка двора');
  say(msg('Загружается двор усадьбы…','Loading the manor courtyard…'));onPrepare?.();
 }
 link.addEventListener('pointerdown',event=>event.stopPropagation());
 link.addEventListener('pointerup',event=>{if(event.pointerType==='touch'){event.preventDefault();event.stopPropagation();activate();}});
 link.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();activate();});
 return {
  reset(){motion.reset();unlocked=false;stage='idle';line='';request++;p=0;say('');link.hidden=true;fade.style.opacity='0';label('Descend to courtyard / Спуститься во двор');},
  unlock(){if(stage!=='idle')return;unlocked=true;link.href=url();label('Descend to courtyard / Спуститься во двор');onPrepare?.();refresh();},
  tick(visible,dt){
   if(stage==='waiting'&&dt>0){
    const now=performance.now();
    if(now>=nextTry){nextTry=now+400;if(!begin())onPrepare?.();}
    if(stage==='waiting'&&now>=deadline){stage='failed';label('Open Adagio directly / Открыть Адажио напрямую');say(msg('Двор не загрузился. Нажмите дверь для входа в Адажио напрямую.','Courtyard failed to load. Tap the door to open Adagio directly.'));}
   }
   if(stage==='descending'){p=motion.tick(dt);fade.style.opacity=String(Math.min(1,Math.max(0,p<.5?p*2.5:(1-p)*2.5)));onProgress?.(p);}
   link.hidden=!(stage==='landed'||stage==='failed'||stage==='waiting'||(stage==='idle'&&unlocked&&visible));
  },
  get traveling(){return stage==='descending'||stage==='landed'||stage==='entering';},
  get inCourtyard(){return p>=.5&&stage!=='idle';},
  get progress(){return p;}
 };
}
