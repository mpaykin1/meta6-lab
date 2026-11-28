const enc=new TextEncoder(), origin='https://mpaykin1.github.io';
const kinds=new Set(['project','offer','request','event','promo','mentor']);
const roles=new Set(['','Творец','Визионер','Исследователь','Наставник','Организатор','Стратег','Объединитель']);
const str=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
async function auth(raw,token){
 if(!raw||raw.length>16384||!token)return null;
 const p=new URLSearchParams(raw),hash=p.get('hash');if(!/^[0-9a-f]{64}$/.test(hash||''))return null;
 const pairs=[...p.entries()].filter(([k])=>k!=='hash');if(new Set(pairs.map(([k])=>k)).size!==pairs.length)return null;
 const ts=Number(p.get('auth_date')),now=Math.floor(Date.now()/1000);if(!Number.isFinite(ts)||ts>now+60||now-ts>86400)return null;
 const k=await crypto.subtle.importKey('raw',enc.encode('WebAppData'),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const secret=await crypto.subtle.sign('HMAC',k,enc.encode(token));
 const key=await crypto.subtle.importKey('raw',secret,{name:'HMAC',hash:'SHA-256'},false,['verify']);
 const msg=pairs.sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>k+'='+v).join('\n');
 const sig=Uint8Array.from(hash.match(/../g),x=>parseInt(x,16));if(!await crypto.subtle.verify('HMAC',key,sig,enc.encode(msg)))return null;
 try{const u=JSON.parse(p.get('user'));return Number.isSafeInteger(u.id)&&u.id>0?{id:String(u.id),username:/^[A-Za-z0-9_]{5,32}$/.test(u.username||'')?u.username:''}:null}catch{return null}
}
export default {async fetch(req,env){
 const o=req.headers.get('Origin'),headers={'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
 if(o===origin){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Methods']='GET, PUT, POST, DELETE, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type, X-Telegram-Init-Data'}
 const json=(x,status=200)=>new Response(JSON.stringify(x),{status,headers});
 if(o&&o!==origin)return json({error:'origin'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 const url=new URL(req.url),path=url.pathname.replace(/\/$/,'');
 if(path==='/health')return json({ok:true});
 const u=await auth(req.headers.get('X-Telegram-Init-Data'),env.BOT_TOKEN);if(!u)return json({error:'auth'},401);
 const db=env.DB;const q=(s,...a)=>db.prepare(s).bind(...a);
 const admin=(env.ADMIN_IDS||'').split(',').map(x=>x.trim()).includes(u.id);
 try{
 const body=async()=>{const t=await req.text();if(t.length>8000)throw Error('invalid body');return JSON.parse(t)};
 if(path==='/profile'&&req.method==='PUT'){
  const p=await body(),name=str(p.name,120),language=str(p.language,120),skills=str(p.skills,1000),needs=str(p.needs,1000),goal=str(p.goal,1000),role=str(p.role,40);
  if(!name||!roles.has(role)||typeof p.public!=='boolean')return json({error:'invalid profile'},400);
  await q('INSERT INTO members(id,name,username,language,skills,needs,goal,role,visible,updated) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,username=excluded.username,language=excluded.language,skills=excluded.skills,needs=excluded.needs,goal=excluded.goal,role=excluded.role,visible=excluded.visible,updated=excluded.updated',u.id,name,u.username,language,skills,needs,goal,role,p.public?1:0,Date.now()).run();
  return json({ok:true});
 }
 if(path==='/profile'&&req.method==='DELETE'){
  await db.batch([q('DELETE FROM posts WHERE owner=?',u.id),q('DELETE FROM members WHERE id=?',u.id)]);return json({ok:true})
 }
 if(path==='/members'&&req.method==='GET'){
  const term=str(url.searchParams.get('q'),120).toLocaleLowerCase('ru');const {results}=await q('SELECT name,username,language,skills,needs,role FROM members WHERE visible=1 AND id<>? ORDER BY updated DESC LIMIT 500',u.id).all();
  const items=results.filter(x=>!term||[x.name,x.language,x.skills,x.needs,x.role].some(v=>v.toLocaleLowerCase('ru').includes(term))).slice(0,30);return json({items})
 }
 if(path==='/posts'&&req.method==='POST'){
  const p=await body(),title=str(p.title,120),text=str(p.body,1000);if(!kinds.has(p.kind)||!title||!text)return json({error:'invalid post'},400);
  const m=await q('SELECT visible FROM members WHERE id=?',u.id).first();if(!m?.visible)return json({error:'publish a voluntary public profile first'},409);
  const recent=await q('SELECT COUNT(*) AS n FROM posts WHERE owner=? AND created>?',u.id,Date.now()-86400000).first();if(recent.n>=10)return json({error:'rate limit'},429);
  const id=crypto.randomUUID();await q('INSERT INTO posts(id,owner,kind,title,body,status,created) VALUES(?,?,?,?,?,?,?)',id,u.id,p.kind,title,text,'pending',Date.now()).run();return json({id,status:'pending'},201)
 }
 if(path==='/posts'&&req.method==='GET'){
  const kind=url.searchParams.get('kind');if(!kinds.has(kind))return json({error:'kind'},400);
  const {results}=await q("SELECT p.id,p.title,p.body,p.created,m.name,m.username FROM posts p JOIN members m ON m.id=p.owner WHERE p.kind=? AND p.status='approved' AND m.visible=1 ORDER BY p.created DESC LIMIT 50",kind).all();return json({items:results})
 }
 if(path==='/moderation'&&admin&&req.method==='GET'){
  const {results}=await q("SELECT p.id,p.kind,p.title,p.body,p.created,m.name FROM posts p JOIN members m ON m.id=p.owner WHERE p.status='pending' AND m.visible=1 ORDER BY p.created LIMIT 100").all();return json({items:results})
 }
 if(path==='/moderation'&&admin&&req.method==='POST'){
  const p=await body();if(!['approved','rejected'].includes(p.status)||typeof p.id!=='string')return json({error:'invalid'},400);
  const result=await q("UPDATE posts SET status=? WHERE id=? AND status='pending'",p.status,p.id).run();return json({ok:result.meta.changes===1})
 }
 return json({error:'not found'},404);
 }catch(e){return json({error:'request failed'},400)}
}};