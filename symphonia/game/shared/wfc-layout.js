import {SimpleTiledModel} from './vendor/wfc-runtime.js';
const data=names=>({tilesize:1,tiles:names.map((name,i)=>({name,bitmap:[i,0,0,255],symmetry:'X',weight:1})),neighbors:names.flatMap(left=>names.filter(right=>right!==left).map(right=>({left,right})))});
function rng(seed){let n=(seed>>>0)||1;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
export function collapsePalette(names,width,height,seed,closed=false){
 if(names.length<3||width<1||height<1||width*height>1024)return null;
 const random=rng(seed);
 for(let attempt=0;attempt<12;attempt++){
  const model=new SimpleTiledModel(data(names),null,width,height,false);
  if(!model.generate(random))continue;
  const result=model.observed.map(i=>names[i]);
  if(closed&&result[0]===result[result.length-1])continue;
  return result;
 }
 return null;
}
export function towerPalette(seed,count=7){return collapsePalette(['plain','bridge','ruin'],count,1,seed,true);}
export function mazeDecor(P,seed){
 const items=['bush','fir','dead_tree','rock1','stump'];
 const field=collapsePalette(items,P.Gs+1,P.Gs+1,seed);
 return (i,j)=>field?.[(j-P.o)*(P.Gs+1)+i-P.o]||null;
}
