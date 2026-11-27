/* META GAMES personal world: existing Observer V7 assets and simulation, no renderer replacement. */
(()=>{
'use strict';
const worldKey='observer-v7-mobile-island-builder',rewardKey='meta_world_rewards_v1';
const user=String(tg?.initDataUnsafe?.user?.id||'browser'), scoped='meta_world_v1_'+user;
const cloud=supported('6.9')&&tg.CloudStorage;
const read=k=>{try{return localStorage.getItem(k)}catch{return null}},write=(k,v)=>{try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch{}};
const parse=(s,d=null)=>{try{return JSON.parse(s)||d}catch{return d}};
const won=id=>{try{return current?.[0]===id&&frame.contentWindow.__isle?.G?.state==='victory'}catch{return false}};
const rewards=[
{id:'seed',title:'Поселение',kind:'settlement',desc:'Вырастить дерево до 3 стадии',check:()=>{const v=parse(read('ashtree.v1'));return !!v?.planted&&Number(v.stage)>=3}},
{id:'veil',title:'Обелиск памяти',kind:'observer',desc:'Найти все 6 воспоминаний в Veil Terraces',check:()=>Number(read('meta-veil-terraces-best'))>=6},
{id:'ash',title:'Крепость пепла',kind:'castle',desc:'Победить в Ashen Path',check:()=>won('ash')},
{id:'underwater',title:'Колодец глубин',kind:'well',desc:'Победить в Underwater World',check:()=>won('underwater')},
{id:'classic',title:'Дозорная башня',kind:'guard',desc:'Победить в Twilight Isle Classic',check:()=>won('classic')},
{id:'isles',title:'Торговая пристань',kind:'market',desc:'Победить в Twilight Isles',check:()=>won('isles')},
{id:'city',title:'Каменный зал',kind:'council',desc:'Открыть концовку Broken City',check:()=>{const v=parse(read('bc_endings'),{});return Object.values(v).some(x=>x===1)}}
];
let data=parse(read(scoped),{rev:0,world:null,earned:[],used:[]}),backup=null,active=false,ready=false,dirty=false,busy=false,slot='a',lastSave=0,visiting=false,visitRaw=null;
if(!Array.isArray(data.earned)||!Array.isArray(data.used))data={rev:0,world:null,earned:[],used:[]};
if(!cloud&&data.world===null)data.world=read(worldKey);
const call=(method,...args)=>new Promise((resolve,reject)=>{let done=false;const t=setTimeout(()=>{if(!done){done=true;reject(Error('Telegram timeout'))}},10000);try{cloud[method](...args,(err,v)=>{if(done)return;done=true;clearTimeout(t);err?reject(Error(String(err))):resolve(v)})}catch(e){clearTimeout(t);reject(e)}});
const status=()=>el('worldSync');
const say=s=>{status().textContent=s};
const local=()=>write(scoped,JSON.stringify(data));
function scan(){if(!ready||visiting)return;let changed=false;for(const r of rewards)if(!data.earned.includes(r.id)&&r.check()){data.earned.push(r.id);changed=true}if(changed){touch();render()}}
function touch(){data.rev=Math.max(Date.now(),Number(data.rev||0)+1);dirty=true;local()}
function snapshot(){if(!active||visiting)return;const raw=read(worldKey);if(raw&&parse(raw)?.version===7&&raw!==data.world){data.world=raw;touch()}}
async function pull(){if(!cloud){ready=true;scan();render();return}say('Загружаю остров из облака…');try{const m=parse(await call('getItem','mgw_manifest'));if(m&&['a','b'].includes(m.s)&&Number.isInteger(m.n)&&m.n>0&&m.n<=96){const keys=Array.from({length:m.n},(_,i)=>'mgw_'+m.s+'_'+i);const parts=await call('getItems',keys);const raw=keys.map(k=>parts[k]||'').join('');const remote=parse(raw);if(remote&&remote.rev===m.rev&&Array.isArray(remote.earned)&&Array.isArray(remote.used)){slot=m.s;if(remote.rev>data.rev){data=remote;local()}else if(data.rev>remote.rev)dirty=true}else throw Error('Incomplete cloud snapshot')}else if(data.rev)dirty=true;say('Облако подключено')}catch{say('Облако недоступно · локальная копия')}finally{ready=true;scan();render()}}
async function push(){if(!cloud||!ready||busy||!dirty)return;busy=true;const rev=data.rev;try{const raw=JSON.stringify(data),parts=raw.match(/[\s\S]{1,850}/g)||[];if(parts.length>96)throw Error('Cloud limit');const next=slot==='a'?'b':'a';for(let i=0;i<parts.length;i++)await call('setItem','mgw_'+next+'_'+i,parts[i]);await call('setItem','mgw_manifest',JSON.stringify({s:next,n:parts.length,rev}));slot=next;if(data.rev===rev)dirty=false;say('Остров сохранён в Telegram')}catch{say('Локальная копия · облако не синхронизировано')}finally{busy=false}}
function render(){el('worldGo').disabled=!ready;el('rewardCount').textContent=data.earned.length+' / '+rewards.length;const root=el('worldRewards');root.replaceChildren();for(const r of rewards){const row=document.createElement('div');row.className='rewardRow';const a=document.createElement('div'),b=document.createElement('b'),c=document.createElement('small');b.textContent=r.title;c.textContent=data.used.includes(r.id)?'Установлено на острове':data.earned.includes(r.id)?'Готово к размещению':r.desc;a.append(b,c);const button=document.createElement('button');button.className='btn';button.textContent=data.used.includes(r.id)?'✓':data.earned.includes(r.id)?'На остров':'Задание';button.disabled=!ready||data.used.includes(r.id);button.onclick=()=>{full();openGame(data.earned.includes(r.id)?'home':r.id)};row.append(a,button);root.append(row)}el('worldGift').hidden=!active||visiting||!rewards.some(r=>data.earned.includes(r.id)&&!data.used.includes(r.id));marketUI();}
function enter(){if(active)return;backup=read(worldKey);if(visiting)write(worldKey,visitRaw);else if(cloud||data.world!==null)write(worldKey,data.world);active=true;render()}
function leave(){if(!active)return;const wasVisit=visiting;snapshot();active=false;visiting=false;visitRaw=null;if(cloud||wasVisit)write(worldKey,backup);backup=null;render();push()}
function placeGift(){if(!active||visiting)return;const r=rewards.find(r=>data.earned.includes(r.id)&&!data.used.includes(r.id));if(!r)return;let api;try{api=frame.contentWindow.__OBSERVER_WORLD_V7__}catch{}if(!api?.ready){el('worldGift').textContent='Остров загружается';return}const placed=placeKind(api,r.kind);if(!placed){el('worldGift').textContent='Найдите свободную землю';return}data.used.push(r.id);snapshot();touch();render();push();if(!el('worldGift').hidden)el('worldGift').textContent='Разместить дар';}
function placeKind(api,kind){const p=api.native.player.pos;let placed=null;for(const distance of [4,6,8,10]){for(let j=0;j<12;j++){const a=j*Math.PI/6,x=p.x+Math.cos(a)*distance,z=p.z+Math.sin(a)*distance;const h=api.native.terrainTop(x,z);if(!Number.isFinite(h)||h<api.native.SEA||api.objects().some(o=>Math.hypot(o.x-x,o.z-z)<4.5))continue;try{placed=api.place(kind,x,z)}catch{}if(placed)break}if(placed)break}return placed}
const market=[['granary','Амбар',20],['school','Школа',30],['monastery','Монастырь',40],['guild','Мастерская',25]];
const kinds=['well','settlement','council','market','guild','tax','school','scholarAction','printing','castle','court','decree','monastery','relief','doctrine','guard','patrol','militia','prison','inquiry','pardon','granary','ration','caravan','healer','quarantine','hospital','fire','brigade','watch','plague','cordon','burial','observer','contact','extraction'];
const balance=()=>Math.max(0,100+data.earned.length*50-Math.max(0,Number(data.spent)||0));
function marketUI(){el('worldCoins').textContent=balance();el('worldMarket').replaceChildren();for(const [kind,title,cost] of market){const b=document.createElement('button');b.className='btn';b.textContent=title+' · '+cost+' ✦';b.disabled=!ready||visiting||balance()<cost;b.onclick=()=>{data.order=kind;touch();render();full();openGame('home')};el('worldMarket').append(b)}el('worldPurchase').hidden=!active||visiting||!market.some(x=>x[0]===data.order);el('worldShare').disabled=!ready||!parse(data.world)?.objects?.length;el('worldVisit').hidden=!invited||active;el('worldVisit').disabled=!ready;}
function purchase(){const item=market.find(x=>x[0]===data.order);if(!active||visiting||!item||balance()<item[2])return;let api;try{api=frame.contentWindow.__OBSERVER_WORLD_V7__}catch{}if(!api?.ready)return;const placed=placeKind(api,item[0]);if(!placed){el('worldPurchase').textContent='Нужна свободная земля';return}data.spent=(Number(data.spent)||0)+item[2];delete data.order;snapshot();touch();render();push();el('worldPurchase').textContent='Построить';}
function encode(){const objects=parse(data.world)?.objects||[];const bytes=[];for(const o of objects.slice(0,80)){const k=kinds.indexOf(o.kind);if(k<0||![o.x,o.y,o.z].every(Number.isFinite)||o.x<3||o.x>60||o.z<3||o.z>60||o.y<0||o.y>63.75)continue;bytes.push(k,Math.round(o.x),Math.round(o.z),Math.round(o.y*4))}return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function decode(s){try{if(!/^[A-Za-z0-9_-]{6,428}$/.test(s))return null;const raw=atob(s.replace(/-/g,'+').replace(/_/g,'/'));if(raw.length%4||raw.length>320)return null;const objects=[];for(let i=0;i<raw.length;i+=4){const [k,x,z,y]=[0,1,2,3].map(n=>raw.charCodeAt(i+n));if(!kinds[k]||x<3||x>60||z<3||z>60||objects.some(o=>Math.hypot(o.x-x,o.z-z)<3))return null;objects.push({id:objects.length+1,kind:kinds[k],x,z,y:y/4,age:0,created:0})}return JSON.stringify({version:7,pop:2,food:8,order:20,suspicion:0,next:objects.length+1,objects,history:[],actors:[],deaths:0,clearedTrees:[]})}catch{return null}}
el('worldShare').onclick=()=>{const code=encode();if(!code)return;const link='https://t.me/World_serverbot?startapp=visit_'+code;const url='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent('Посети копию моего острова META GAMES');if(inTG)tg.openTelegramLink(url);else window.open(url,'_blank','noopener')};
const invite=tg?.initDataUnsafe?.start_param||new URLSearchParams(location.search).get('startapp')||'';
let invited=invite.startsWith('visit_')?decode(invite.slice(6)):null;
el('worldVisit').onclick=()=>{if(!ready||!invited)return;visitRaw=invited;visiting=true;full();openGame('home');el('gameName').textContent='Гостевой остров · копия';};
el('worldPurchase').onclick=purchase;
window.MetaPersonalWorld={enter,leave,scan,canEnter:()=>ready,isVisit:()=>visiting};

el('worldGo').onclick=()=>{if(ready){full();openGame('home')}};el('worldGift').onclick=placeGift;
setInterval(()=>{snapshot();scan();if(Date.now()-lastSave>15000){lastSave=Date.now();push()}},2500);
document.addEventListener('visibilitychange',()=>{if(document.hidden){snapshot();push()}});
window.addEventListener('pagehide',()=>{snapshot();local();if(visiting)write(worldKey,backup)});
render();pull();
})();