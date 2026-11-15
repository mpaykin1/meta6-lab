// GitHub GraphQL: one request for up to 100 numbered PRs, including closed PRs.
export function numbersFromTable(md){
 const ids=[...md.matchAll(/^\| #(\d+) \|/gm)].map(m=>Number(m[1]));
 if(!ids.length||ids.some(n=>!Number.isSafeInteger(n)||n<1))
  throw Error('нет данных: отсутствуют номера PR в SLIYANIE.md');
 return [...new Set(ids)];
}
export function queryFor(repo,ids){
 const [owner,name,...rest]=String(repo||'').split('/');
 if(!owner||!name||rest.length)throw Error('нет данных: репозиторий не задан');
 const fields=ids.map(n=>{
  if(!Number.isSafeInteger(n)||n<1)throw Error('нет данных: недопустимый номер PR');
  return 'p'+n+':pullRequest(number:'+n+'){state merged mergeable}';
 }).join(' ');
 return 'query{repository(owner:'+JSON.stringify(owner)+',name:'+JSON.stringify(name)+'){'+fields+'}}';
}
export function classify(pr){
 if(!pr)throw Error('нет данных: отсутствует PR в ответе GraphQL');
 if(pr.merged===true||pr.state==='MERGED')return 'merged';
 if(pr.state==='CLOSED')return 'closed';
 if(pr.state==='OPEN'&&pr.mergeable==='CONFLICTING')return 'open dirty';
 if(pr.state==='OPEN'&&pr.mergeable==='UNKNOWN')return 'open unknown';
 if(pr.state==='OPEN'&&pr.mergeable==='MERGEABLE')return 'open';
 throw Error('нет данных: неизвестное состояние PR');
}
export function parseResponse(data,ids){
 if(!data||typeof data!=='object')
  throw Error('нет данных: GitHub GraphQL repository отсутствует');
 const out={};
 for(const n of ids)out[n]=classify(data['p'+n]);
 return out;
}
export async function requestBatch(ids,{repository,token,request=fetch,
 wait=ms=>new Promise(done=>setTimeout(done,ms)),now=()=>Date.now()}={}){
 if(!token)throw Error('нет данных: GH_TOKEN отсутствует');
 const out={};
 for(let i=0;i<ids.length;i+=100){
  const batch=ids.slice(i,i+100);
  const query=queryFor(repository,batch);
  let success=false;
  for(let attempt=0;attempt<2;attempt++){
   const r=await request('https://api.github.com/graphql',{
    method:'POST',
    headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',
     Accept:'application/vnd.github+json'},
    body:JSON.stringify({query})});
   if(!r.ok){
    const remaining=Number(r.headers.get('x-ratelimit-remaining'));
    const reset=Number(r.headers.get('x-ratelimit-reset'))*1000;
    if((r.status===403||r.status===429)&&remaining===0&&Number.isFinite(reset)&&reset>0){
     const delay=reset-now();
     if(delay>0&&delay<=8*60*1000&&attempt===0){await wait(delay+1000);continue}
     throw Error('нет данных: квота до '+new Date(reset).toISOString().slice(11,16)+' UTC');
    }
    throw Error('нет данных: GitHub GraphQL HTTP '+r.status);
   }
   const json=await r.json();
   if(json?.errors?.length||!json?.data?.repository)
    throw Error('нет данных: неполный ответ GitHub GraphQL');
   Object.assign(out,parseResponse(json.data.repository,batch));
   success=true;break;
  }
  if(!success)throw Error('нет данных: повтор GraphQL не завершён');
 }
 return out;
}
