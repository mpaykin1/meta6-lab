export function checkedPrTarget(pr,ref){
 const base=pr?.base?.ref,head=pr?.head?.ref;
 if(typeof base!=='string'||typeof head!=='string'||!base||!head||head===base)
  throw Error('нет данных: PR head/base');
 if(typeof ref!=='string'||ref!==head)throw Error('wrong PR HEAD: '+String(ref));
 return head;
}
