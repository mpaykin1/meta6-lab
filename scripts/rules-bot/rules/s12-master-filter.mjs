export const id='s12-master-filter';
export const title='ЗВУК 12 — мягкий фильтр и компрессор';
export async function check({page}){
 const result=await page.evaluate(()=>{
  const edges=window.__RULES_CAPTURE__?.edges||[];
  const nodes=[...new Set(edges.flat())];
  const dest=nodes.filter(n=>n?.constructor?.name==='AudioDestinationNode');
  if(!dest.length)return {error:'После первого жеста звуковой граф не подключён к выходу'};
  const gains=nodes.filter(n=>n?.constructor?.name==='GainNode');
  const filters=nodes.filter(n=>n?.constructor?.name==='BiquadFilterNode');
  const comps=nodes.filter(n=>n?.constructor?.name==='DynamicsCompressorNode');
  const edge=(a,b)=>edges.some(pair=>pair[0]===a&&pair[1]===b);
  if(gains.some(g=>dest.some(d=>edge(g,d))))return {error:'Обход фильтра: GainNode подключён прямо к выходу'};
  for(const f of filters){
   if(f.type!=='lowpass'||f.frequency.value<5800||f.frequency.value>6500)continue;
   for(const c of comps){
    if(edge(f,c)&&dest.some(d=>edge(c,d))&&gains.some(g=>edge(g,f))){
     return {freq:Math.round(f.frequency.value)};
    }
   }
  }
  return {error:'Не найдена рабочая цепь Gain → lowpass 5,8–6,5 кГц → compressor → выход'};
 });
 return result.error?{status:'НАРУШЕНО',reason:result.error}:{status:'ВЫПОЛНЕНО',reason:'После первого жеста сигнал идёт через lowpass '+result.freq+' Гц и компрессор без прямого обхода'};
}