// Visit history is not a claim of game completion or an inventory.
const KEY='meta-games:worlds:v1';
const LIMIT=40;
const valid=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9-]{0,79}$/.test(id);
function read(storage){
 try{
  const data=JSON.parse(storage.getItem(KEY)||'{}');
  return data?.version===1&&Array.isArray(data.visited)
   ?[...new Set(data.visited.filter(valid))].slice(-LIMIT):[];
 }catch{return []}
}
export function createWorldProgress(storage){
 if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function')
  throw new TypeError('Storage interface missing');
 return Object.freeze({
  visited:()=>read(storage),
  enter(id){
   if(!valid(id))throw new TypeError('Invalid world ID');
   const visited=[...read(storage).filter(x=>x!==id),id].slice(-LIMIT);
   try{storage.setItem(KEY,JSON.stringify({version:1,visited}))}catch{}
   return visited;
  },
  clear(){try{storage.removeItem(KEY)}catch{}}
 });
}
