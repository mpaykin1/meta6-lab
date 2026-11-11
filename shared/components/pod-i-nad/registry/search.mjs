// 125 exact Pod i Nad source definitions, without loading the original 447 KB game.
// Search reads a compact index; getDefinition loads only the requested kind's source.
const base=new URL('./',import.meta.url);
let indexPromise;
const sources=new Map();
export async function getRegistryIndex(){
  if(!indexPromise)indexPromise=fetch(new URL('index.json',base))
    .then(r=>{if(!r.ok)throw Error('Registry index HTTP '+r.status);return r.json()})
    .catch(e=>{indexPromise=null;throw e});
  return indexPromise;
}
export function searchRegistry(index,query,{kind='',pack='',limit=30}={}){
  const words=String(query||'').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return (index.entries||[]).filter(c=>(!kind||c.kind===kind)&&(!pack||c.pack===pack))
    .map(c=>{
      const values=[c.id,c.name,c.kind,c.pack,c.source_key,...(c.tags||[])].map(v=>String(v).toLocaleLowerCase());
      const score=words.reduce((n,w)=>n+(values.some(v=>v===w)?5:values.some(v=>v.includes(w))?2:0),0);
      return {c,score};
    })
    .filter(x=>!words.length||x.score>0)
    .sort((a,b)=>b.score-a.score||a.c.id.localeCompare(b.c.id))
    .slice(0,Math.max(0,limit)).map(x=>x.c);
}
export async function findRegistry(query,options={}){
  return searchRegistry(await getRegistryIndex(),query,options);
}
export async function getDefinition(id){
  const index=await getRegistryIndex();
  const entry=index.entries.find(c=>c.id===id);
  if(!entry)throw Error('Unknown definition: '+id);
  if(!sources.has(entry.kind)){
    sources.set(entry.kind,fetch(new URL('sources/'+entry.kind+'.json',base))
      .then(r=>{if(!r.ok)throw Error('Source HTTP '+r.status);return r.json()})
      .catch(e=>{sources.delete(entry.kind);throw e}));
  }
  const data=await sources.get(entry.kind);
  const definition=data.definitions.find(c=>c.id===id);
  if(!definition)throw Error('Source unavailable: '+id);
  return {...entry,code:definition.source};
}
