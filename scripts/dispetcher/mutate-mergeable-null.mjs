import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

// Permanent regression trap: inject four adversarial mutations into the real module.
export async function verifyMutations(){
 const source=await fs.readFile(new URL('./build.mjs',import.meta.url),'utf8');
 const cases=[
  {
   name:'skip-all-retries',
   from:'retries<3',
   to:'retries<0',
   check:async mod=>{
    let calls=0;
    await mod.resolveConflict({mergeable:null},async()=>{calls++;return {mergeable:false}},null,async()=>{});
    assert.equal(calls,1);
   }
  },
  {
   name:'lose-previous-conflict',
   from:'conflict:prior,unresolved:true',
   to:'conflict:false,unresolved:true',
   check:async mod=>{
    const value=await mod.resolveConflict({mergeable:null},async()=>({mergeable:null}),true,async()=>{});
    assert.equal(value.conflict,true);
   }
  },
  {
   name:'unknown-passes-as-clean',
   from:'conflict:prior,unresolved:true',
   to:'conflict:prior??false,unresolved:true',
   check:async mod=>{
    const value=await mod.resolveConflict({mergeable:null},async()=>({mergeable:null}),null,async()=>{});
    assert.equal(value.conflict,null);
   }
  },
  {
   name:'previous-red-falsely-clean',
   from:"return problem&&problem[1].includes('Конфликт с main')?true:null;",
   to:"return Boolean(problem&&problem[1].includes('Конфликт с main'));",
   check:async mod=>{
    const previous='### PR #42\\n- Проблема: Красная проверка: bot\\n- Взял: —\\n';
    assert.equal(mod.previousConflict(previous,42),null);
   }
  },
  {
   name:'hardcode-clean-for-conflicts',
   from:"conflict:current.mergeable===false||current.mergeable_state==='dirty'",
   to:'conflict:false',
   check:async mod=>{
    const value=await mod.resolveConflict({mergeable:false},async()=>{throw Error('not called')},false,async()=>{});
    assert.equal(value.conflict,true);
   }
  }
 ];
 for(const item of cases){
  assert.ok(source.includes(item.from),'Mutation anchor missing: '+item.name);
  const changed=source.replace(item.from,item.to);
  const mod=await import('data:text/javascript;base64,'+Buffer.from(changed).toString('base64'));
  let caught=false;
  try{await item.check(mod)}catch(e){caught=true}
  assert.ok(caught,'Mutation survived: '+item.name);
 }
 return cases.length;
}
