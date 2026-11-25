// Cross-chapter handoff, shares Nit with original Overture piano and combat.
import {Nit} from './nit.js';
import {readCourtyardStory} from './ink-courtyard.js';
export function createCourtyardGate({link,fade,caption,language,onTravel}){
 let unlocked=false,traveling=false,line='',request=0;
 const url=()=>{const target=new URL('../../',location.href);const token=Nit.encode();if(token)target.searchParams.set('nit',token);return target.href;};
 function refresh(){
  if(!unlocked||traveling)return;
  const seq=++request;
  readCourtyardStory(Nit.read(),language()).then(value=>{if(seq===request&&!traveling)line=value;});
 }
 link.addEventListener('click',event=>{
  if(!unlocked||traveling){event.preventDefault();return;}
  event.preventDefault();traveling=true;link.hidden=true;
  const next=url();onTravel();if(line)caption(line);fade.classList.add('active');
  setTimeout(()=>location.assign(next),1200);
 });
 return {
  reset(){unlocked=false;traveling=false;line='';request++;link.hidden=true;fade.classList.remove('active');},
  unlock(){if(traveling)return;unlocked=true;link.href=url();refresh();},
  tick(visible){link.hidden=!(unlocked&&visible&&!traveling);}
 };
}
