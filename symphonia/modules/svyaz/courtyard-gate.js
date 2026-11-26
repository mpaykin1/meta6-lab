// User-initiated descent, courtyard landing, explicit entry to Adagio.
import {Nit} from './nit.js';
import {readCourtyardStory} from './ink-courtyard.js';
import {createTransition} from './chapter-transition.js';
export function createCourtyardGate({link,fade,caption,language,onTravel,onProgress,onPrepare,onLand}){
 let unlocked=false,stage='idle',line='',request=0,p=0;
 const motion=createTransition();
 const url=()=>{const target=new URL('../../',location.href);const token=Nit.encode();if(token)target.searchParams.set('nit',token);return target.href;};
 function refresh(){if(!unlocked||stage!=='idle')return;const seq=++request;readCourtyardStory(Nit.read(),language()).then(value=>{if(seq===request&&stage==='idle')line=value;});}
 function label(s){link.setAttribute('aria-label',s);}
 link.addEventListener('click',event=>{
  event.preventDefault();
  if(stage==='landed'){stage='entering';link.hidden=true;location.assign(url());return;}
  if(!unlocked||stage!=='idle')return;
  if(!onTravel()){onPrepare?.();return;} // Never silently skip the actual courtyard.
  stage='descending';p=0;link.hidden=true;if(line)caption(line);
  motion.start(3600,()=>{stage='landed';p=1;fade.style.opacity='0';label('Enter manor / Войти в усадьбу');onLand?.();});
 });
 return {
  reset(){motion.reset();unlocked=false;stage='idle';line='';request++;p=0;link.hidden=true;fade.style.opacity='0';label('Descend to courtyard / Спуститься во двор');},
  unlock(){if(stage!=='idle')return;unlocked=true;link.href=url();label('Descend to courtyard / Спуститься во двор');onPrepare?.();refresh();},
  tick(visible,dt){
   if(stage==='descending'){p=motion.tick(dt);fade.style.opacity=String(Math.min(1,Math.max(0,p<.5?p*2.5:(1-p)*2.5)));onProgress?.(p);}
   link.hidden=!(stage==='landed'||(stage==='idle'&&unlocked&&visible));
  },
  get traveling(){return stage==='descending'||stage==='landed'||stage==='entering';},
  get inCourtyard(){return p>=.5&&stage!=='idle';},
  get progress(){return p;}
 };
}
