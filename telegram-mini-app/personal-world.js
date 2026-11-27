/* META GAMES personal world: existing Observer V7 assets and simulation, no renderer replacement. */
(()=>{
'use strict';
const worldKey='observer-v7-mobile-island-builder',rewardKey='meta_world_rewards_v1';
const user=String(tg?.initDataUnsafe?.user?.id||'browser'), scoped='meta_world_v1_'+user;
const cloud=supported('6.9')&&tg.CloudStorage;
const read=k=>{try{return localStorage.getItem(k)}catch{return null}},write=(k,v)=>{try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch{}};
const parse=(s,d=null)=>{try{return JSON.parse(s)||d}catch{return d}};
const rewards=[
{id:'seed',title:'Поселение',kind:'settlement',desc:'Вырастить дерево до 3 стадии',check:()=>{const v=parse(read('ashtree.v1'));return !!v?.planted&&Number(v.stage)>=3}},
{id:'veil',title:'Обелиск памяти',kind:'observer',desc:'Найти все 6 воспоминаний в Veil Terraces',check:()=>Number(read('meta-veil-terraces-best'))>=6}
];
let data=parse(read(scoped),{rev:0,world:null,earned:[],used:[]}),backup=null,active=false,ready=false,dirty=false,busy=false,slot='a',lastSave=0;
if(!Array.isArray(data.earned)||!Array.isArray(data.used))data={rev:0,world:null,earned:[],used:[]};
if(!cloud&&data.world===null)data.world=read(worldKey);
const call=(method,...args)=>new Promise((resolve,reject)=>{let done=false;const t=setTimeout(()=>{if(!done){done=true;reject(Error('Telegram timeout'))}},10000);try{cloud[method](...args,(err,v)=>{if(done)return;done=true;clearTimeout(t);err?reject(Error(String(err))):resolve(v)})}catch(e){clearTimeout(t);reject(e)}});
const status=()=>el('worldSync');
const say=s=>{status().textContent=s};
const local=()=>write(scoped,JSON.stringify(data));
function scan(){let changed=false;for(const r of rewards)if(!data.earned.includes(r.id)&&r.check()){data.earned.push(r.id);changed=true}if(changed){touch();render()}}
function touch(){data.rev=Math.max(Date.now(),Number(data.rev||0)+1);dirty=true;local()}
function snapshot(){if(!active)return;const raw=read(worldKey);if(raw&&parse(raw)?.version===7&&raw!==data.world){data.world=raw;touch()}}
async function pull(){if(!cloud){ready=true;render();return}say('Загружаю остров из облака…');try{const m=parse(await call('getItem','mgw_manifest'));if(m&&['a','b'].includes(m.s)&&Number.isInteger(m.n)&&m.n>0&&m.n<=96){const keys=Array.from({length:m.n},(_,i)=>'mgw_'+m.s+'_'+i);const parts=await call('getItems',keys);const raw=keys.map(k=>parts[k]||'').join('');const remote=parse(raw);if(remote&&remote.rev===m.rev&&Array.isArray(remote.earned)&&Array.isArray(remote.used)){slot=m.s;if(remote.rev>data.rev){data=remote;local()}else if(data.rev>remote.rev)dirty=true}else throw Error('Incomplete cloud snapshot')}else if(data.rev)dirty=true;say('Облако подключено')}catch{say('Облако недоступно · локальная копия')}finally{ready=true;scan();render()}}
async function push(){if(!cloud||!ready||busy||!dirty)return;busy=true;const rev=data.rev;try{const raw=JSON.stringify(data),parts=raw.match(/[\s\S]{1,850}/g)||[];if(parts.length>96)throw Error('Cloud limit');const next=slot==='a'?'b':'a';for(let i=0;i<parts.length;i++)await call('setItem','mgw_'+next+'_'+i,parts[i]);await call('setItem','mgw_manifest',JSON.stringify({s:next,n:parts.length,rev}));slot=next;if(data.rev===rev)dirty=false;say('Остров сохранён в Telegram')}catch{say('Локальная копия · облако не синхронизировано')}finally{busy=false}}
function render(){el('worldGo').disabled=!ready;el('rewardCount').textContent=data.earned.length+' / '+rewards.length;const root=el('worldRewards');root.replaceChildren();for(const r of rewards){const row=document.createElement('div');row.className='rewardRow';const a=document.createElement('div'),b=document.createElement('b'),c=document.createElement('small');b.textContent=r.title;c.textContent=data.used.includes(r.id)?'Установлено на острове':data.earned.includes(r.id)?'Готово к размещению':r.desc;a.append(b,c);const button=document.createElement('button');button.className='btn';button.textContent=data.used.includes(r.id)?'✓':data.earned.includes(r.id)?'На остров':'Задание';button.disabled=!ready||data.used.includes(r.id);button.onclick=()=>{full();openGame(data.earned.includes(r.id)?'home':r.id)};row.append(a,button);root.append(row)}el('worldGift').hidden=!active||!rewards.some(r=>data.earned.includes(r.id)&&!data.used.includes(r.id));}
function enter(){if(active)return;backup=read(worldKey);if(cloud||data.world!==null)write(worldKey,data.world);active=true;render()}
function leave(){if(!active)return;snapshot();active=false;if(cloud)write(worldKey,backup);backup=null;render();push()}
function placeGift(){if(!active)return;const r=rewards.find(r=>data.earned.includes(r.id)&&!data.used.includes(r.id));if(!r)return;let api;try{api=frame.contentWindow.__OBSERVER_WORLD_V7__}catch{}if(!api?.ready){el('worldGift').textContent='Остров загружается';return}const p=api.native.player.pos;let placed=null;for(const distance of [4,6,8,10]){for(let j=0;j<12;j++){const a=j*Math.PI/6,x=p.x+Math.cos(a)*distance,z=p.z+Math.sin(a)*distance;const h=api.native.terrainTop(x,z);if(!Number.isFinite(h)||h<api.native.SEA||api.objects().some(o=>Math.hypot(o.x-x,o.z-z)<4.5))continue;try{placed=api.place(r.kind,x,z)}catch{}if(placed)break}if(placed)break}if(!placed){el('worldGift').textContent='Найдите свободную землю';return}data.used.push(r.id);snapshot();touch();render();push();if(!el('worldGift').hidden)el('worldGift').textContent='Разместить дар';}
window.MetaPersonalWorld={enter,leave,scan,canEnter:()=>ready};
el('worldGo').onclick=()=>{if(ready){full();openGame('home')}};el('worldGift').onclick=placeGift;
setInterval(()=>{snapshot();scan();if(Date.now()-lastSave>15000){lastSave=Date.now();push()}},2500);
document.addEventListener('visibilitychange',()=>{if(document.hidden){snapshot();push()}});
window.addEventListener('pagehide',()=>{snapshot();local()});
render();pull();
})();