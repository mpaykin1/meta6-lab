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

// Regression: a successful CI must never ship the old noisy, under-resolved hero.
import fs from 'node:fs';
const runtime=fs.readFileSync('skins/runtime/skin-runtime.js','utf8');
const game=fs.readFileSync('games/skin-trainer/index.html','utf8');
function assertRenderingContract(rt,html){
 if(!rt.includes('p.file?1:'))throw Error('RENDER: авторский PNG дублируется и теряет фактуру');
 if(!html.includes('Math.floor(w),Math.floor(h)'))throw Error('RENDER: постобработка снижает разрешение');
 if(!html.includes('window.__SKIN?2.85:6'))throw Error('RENDER: герой слишком далеко от камеры');
 if(html.includes(')*.07;                    // зерно'))throw Error('RENDER: шум скрывает текстуру');
}
assertRenderingContract(runtime,game);
for(const [name,rt,html] of [
 ['повторные полупрозрачные накладки',runtime.replace('p.file?1:','p.file?3:'),game],
 ['пониженное разрешение',runtime,game.replace('Math.floor(w),Math.floor(h)','Math.floor(w*.8),Math.floor(h*.8)')],
 ['слишком далёкая камера',runtime,game.replace('window.__SKIN?2.85:6','window.__SKIN?3.6:6')]
]){
 let caught=false;try{assertRenderingContract(rt,html);}catch{caught=true;}
 if(!caught)throw Error('ЛОВУШКА ПРОПУЩЕНА: '+name);
 console.log('ЛОВУШКА СРАБОТАЛА: '+name);
}
