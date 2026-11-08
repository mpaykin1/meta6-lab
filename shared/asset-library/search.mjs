// Dependency-free searchable index; never marks source-only records as loadable.
const BASE = new URL('./catalog.json', import.meta.url);
let cache;
export async function getCatalog({url=BASE,refresh=false}={}) {
  if (!cache || refresh || String(url)!==String(BASE)) {
    const response=await fetch(url);
    if (!response.ok) throw new Error('Catalog fetch failed: '+response.status);
    const data=await response.json();
    if (!Array.isArray(data.components)) throw new Error('Invalid component catalog');
    if (String(url)===String(BASE)) cache=data;
    return data;
  }
  return cache;
}
export function searchComponents(catalog, query, {kind,status,limit=20}={}) {
  const words=String(query||'').toLowerCase().trim().split(/\s+/).filter(Boolean);
  return (catalog.components||[]).filter(c=>(!kind||c.kind===kind)&&(!status||c.status===status))
    .map(c=>{
      const fields=[c.id,c.name,...(c.purpose||[]),...(c.tags||[])].map(v=>String(v).toLowerCase());
      const score=words.reduce((n,w)=>n+(fields.some(f=>f===w)?5:fields.some(f=>f.includes(w))?2:0),0);
      return {...c,score};
    }).filter(c=>!words.length||c.score>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,Math.max(0,limit));
}
export async function findComponents(query,options={}) {
  return searchComponents(await getCatalog(),query,options);
}
export async function resolveComponent(id,{loader=globalThis.MetaShared}={}) {
  const item=(await getCatalog()).components.find(c=>c.id===id);
  if (!item) throw new Error('Unknown component: '+id);
  if (item.status!=='READY') throw new Error('Component is not READY: '+id);
  if (item.entry) return import(new URL(item.entry,import.meta.url).href);
  if (!loader?.use) throw new Error('Load shared/loader.js before resolving components');
  return loader.use(item.loader_id);
}
