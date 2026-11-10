import path from 'node:path';

// Match actual file references in owner source; never infer links from category names.
const extension=/\.(?:glb|gltf|png|webp|jpe?g|gif|svg|mp3|ogg|wav|bin|json)(?:[?#].*)?$/i;
const quoted=/(['"`])([^'"`\r\n]{1,350}?)\1/g;
const urlCall=/url\(\s*([^\s)]+)\s*\)/gi;
const normalise=value=>value.replace(/\\/g,'/').replace(/[?#].*$/,'').replace(/^\.\//,'')
 .replace(/^\/+/,'');

export function linkedAssets(code,game,entries=[]){
 const candidates=entries.filter(item=>item.game===game&&item.kind!=='solution'&&
  extension.test(item.source_path||''));
 const literals=[];
 for(const match of code.matchAll(quoted))if(extension.test(match[2]))literals.push(match[2]);
 for(const match of code.matchAll(urlCall)){
  const value=match[1].replace(/^['"]|['"]$/g,'');
  if(extension.test(value))literals.push(value);
 }
 const ids=new Set(),unresolved=[];
 for(const literal of new Set(literals)){
  if(/^(?:data:|https?:|\/\/)/i.test(literal))continue;
  const ref=normalise(literal);
  const filename=path.posix.basename(ref);
  let matches=candidates.filter(item=>normalise(item.source_path)===ref||
   normalise(item.source_path).endsWith('/'+ref));
  if(!matches.length)matches=candidates.filter(item=>path.posix.basename(item.source_path)===filename);
  if(matches.length===1)ids.add(matches[0].id);
  else unresolved.push({reference:literal,reason:matches.length?'Ambiguous library asset':'Not indexed'});
 }
 return {ids:[...ids].sort(),unresolved};
}
