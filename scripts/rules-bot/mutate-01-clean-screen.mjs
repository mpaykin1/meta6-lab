// K5: four independently broken training copies, including CSS pseudo-text deception.
import fs from 'node:fs';
import path from 'node:path';
import {audit,formatReport} from './run.mjs';
import {root} from './probe.mjs';
const base=fs.readFileSync(path.join(root,'games/rules-trainer/index.html'),'utf8');
const scenarios=[
 {id:'persistent-hud',signature:'Постоянный текст',edit:s=>s.replace('</body>','<script>{const d=document.createElement("div");d.textContent="ПОСТОЯННЫЙ HUD 42";d.style="position:fixed;top:40%;left:30%;color:white;z-index:999";document.body.append(d)}</script></body>')},
 {id:'unlabeled-menu',signature:'кнопки меню',edit:s=>s.replace('</body>','<script>setInterval(()=>document.querySelector("#menuBtn")?.removeAttribute("aria-label"),50)</script></body>')},
 {id:'pseudo-content-deception',signature:'Постоянный текст',edit:s=>s.replace('</head>','<style>body::after{content:"CSS HUD 888";position:fixed;left:25%;top:30%;color:white;font-size:23px;z-index:9999}</style></head>')},
 {id:'canvas-text-overlay',signature:'canvas',edit:s=>s.replace('</body>','<script>const c=document.createElement("canvas");c.style="position:fixed;left:20%;top:30%;z-index:9999;background:black;width:220px;height:90px";document.body.append(c);const g=c.getContext("2d");g.fillStyle="white";g.font="22px sans-serif";g.fillText("ЭКРАННЫЙ ТЕКСТ",10,45)</script></body>')}
];
const healthy=await audit({ids:['01-clean-screen']});
if(healthy.length!==2||healthy.some(x=>x.status!=='ВЫПОЛНЕНО'))throw Error('Чистый тренажёр ложноположительно красный: '+formatReport(healthy));
for(const scenario of scenarios){
 const dir=fs.mkdtempSync(path.join(root,'games/.rules-bot-mutation-'));
 try{
  const changed=scenario.edit(base);
  if(changed===base)throw Error('Мутация не применилась '+scenario.id);
  fs.writeFileSync(path.join(dir,'index.html'),changed);
  const result=await audit({gameDir:dir,ids:['01-clean-screen']});
  if(result.length!==2||result.some(x=>x.status!=='НАРУШЕНО'||!x.reason.includes(scenario.signature)))
   throw Error('Мутация не поймана именно целевым правилом: '+scenario.id+'\n'+formatReport(result));
  console.log('MUTATION_CAUGHT clean-screen '+scenario.id);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
}