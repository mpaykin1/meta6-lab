// Cross-chapter handoff. Ink reads Nit; Tween drives only camera/fog, not the player rig.
import {Nit} from './nit.js';
import {readCourtyardStory} from './ink-courtyard.js';
import {createTransition} from './chapter-transition.js';
export function createCourtyardGate({link,fade,caption,language,onTravel,onProgress}){
 let unlocked=false,traveling=false,line='',request=0;
 const motion=createTransition();
 const url=()=>{const target=new URL('../../',location.href);const token=Nit.encode();if(token)target.searchParams.set('nit',token);return target.href;};
 function refresh(){
  if(!unlocked||traveling)return;
  const seq=++request;
  readCourtyardStory(Nit.read(),language()).then(value=>{if(seq===request&&!traveling)line=value;});
 }
 link.addEventListener('click',event=>{
  if(!unlocked||traveling){event.preventDefault();return;}
  event.preventDefault();traveling=true;link.hidden=true;
  const next=url();onTravel();if(line)caption(line);
  motion.start(2400,()=>{fade.style.opacity='1';location.assign(next);});
 });
 return {
  reset(){motion.reset();unlocked=false;traveling=false;line='';request++;link.hidden=true;fade.style.opacity='0';},
  unlock(){if(traveling)return;unlocked=true;link.href=url();refresh();},
  tick(visible,dt){link.hidden=!(unlocked&&visible&&!traveling);if(traveling){const p=motion.tick(dt);fade.style.opacity=String(Math.min(1,Math.max(0,(p-.15)/.85)));onProgress?.(p);}},
  get traveling(){return traveling;}
 };
}
