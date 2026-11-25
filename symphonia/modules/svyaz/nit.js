// Shared, optional memory for SYMPHONIA chapters 2 and 4.
const KEY = 'mg_nit_v1';
const fields = {luchnik:['pobedy','porazheniya','yarus_max','luk','perya'],adagio:['krug','smerti','zerkalo']};
const empty = () => ({luchnik:{pobedy:0,porazheniya:0,yarus_max:0,luk:'',perya:0},adagio:{krug:0,smerti:0,zerkalo:false}});
function clean(input) {
  const out=empty();
  for(const section of Object.keys(fields)) for(const field of fields[section]) {
    const v=input?.[section]?.[field];
    if(field==='luk') {if(typeof v==='string' && /^[a-zA-Z0-9_-]{1,64}$/.test(v)) out[section][field]=v;}
    else if(field==='zerkalo') out[section][field]=v===true;
    else if(typeof v==='number' && Number.isFinite(v)) out[section][field]=Math.min(2147483647,Math.max(0,Math.floor(v)));
  }
  return out;
}
function merge(a,b) {
  const out=clean(a), next=clean(b);
  for(const section of Object.keys(fields)) for(const field of fields[section]) {
    if(field==='luk') continue;
    if(field==='zerkalo') out[section][field] ||= next[section][field];
    else out[section][field]=Math.max(out[section][field],next[section][field]);
  }
  if(next.luchnik.luk && (!out.luchnik.luk || next.luchnik.yarus_max>=a.luchnik.yarus_max)) out.luchnik.luk=next.luchnik.luk;
  return out;
}
let memory=empty();
function read() {
  try {memory=merge(memory,clean(JSON.parse(localStorage.getItem(KEY)||'null')));} catch {}
  return clean(memory);
}
function persist(value) {
  memory=clean(value);
  try {localStorage.setItem(KEY,JSON.stringify(memory));} catch {}
  return clean(memory);
}
function write(section,patch) {
  const state=read();
  if(!Object.hasOwn(fields,section) || !patch || typeof patch!=='object') return state;
  for(const field of fields[section]) if(Object.hasOwn(patch,field)) {
    const value=patch[field], normalized=clean({[section]:{[field]:value}})[section][field];
    if(field==='luk') {if(normalized) state[section][field]=normalized;}
    else if(field==='zerkalo') state[section][field] ||= normalized;
    else state[section][field]=Math.max(state[section][field],normalized);
  }
  return persist(state);
}
function encode() {try {return btoa(JSON.stringify(read()));} catch {return '';}}
function importURL() {
  try {
    const url=new URL(location.href), token=url.searchParams.get('nit');
    if(token===null) return read();
    if(token.length<=4096) {
      try {persist(merge(read(),clean(JSON.parse(atob(token.replace(/-/g,'+').replace(/_/g,'/'))))));} catch {}
    }
    url.searchParams.delete('nit');
    try {history.replaceState(history.state,'',url.href);} catch {}
  } catch {}
  return read();
}
const Nit=Object.freeze({read,write,encode,importURL});
Nit.importURL();
export {Nit};
