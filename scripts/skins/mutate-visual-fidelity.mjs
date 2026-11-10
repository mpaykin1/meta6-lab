#!/usr/bin/env node
// К5: визуальный контроль должен отклонять именно старые дефекты.
import {validateArchitecture,assertVisual} from './verify-visual-fidelity.mjs';
function rejected(name,fn){
 let bad=false;try{fn();}catch(e){if(!String(e.message).includes('ВИЗУАЛЬНОЕ СООТВЕТСТВИЕ:'))throw e;bad=true;}
 if(!bad)throw Error('ЛОВУШКА ПРОПУЩЕНА: '+name);
 console.log('ЛОВУШКА СРАБОТАЛА: '+name);
}
const base={parts:[
 {id:'head',layer:'3d',material:'rust'},
 {id:'head-front-art',layer:'2.5d',file:'parts/head.png',material:'rust-transparent'}]};
rejected('броня без исходной накладки',()=>validateArchitecture({parts:[base.parts[0]]},''));
rejected('рисунок подменён текстурой шума',()=>validateArchitecture(
 {parts:[{...base.parts[0],file:'textures/rust.png'},base.parts[1]]},''));
rejected('текстура ошибочно используется как emissiveMap',()=>validateArchitecture(base,'emissiveMap:emit||map'));
rejected('светящаяся броня уничтожает цвет',()=>validateArchitecture(
 {parts:[base.parts[0],{...base.parts[1],material:'glow'}]},''));
const reference={width:180,height:240,detail:20,edges:.24,bright:.12};
rejected('герой слишком маленький',()=>assertVisual(reference,{...reference,width:60}));
rejected('потеряны трещины и шестерёнки',()=>assertVisual(reference,{...reference,edges:.02}));
rejected('размыта детализация',()=>assertVisual(reference,{...reference,detail:3}));
rejected('пересвет',()=>assertVisual(reference,{...reference,bright:.9}));
assertVisual(reference,reference);
console.log('К5: все 8 визуальных ловушек сработали');
