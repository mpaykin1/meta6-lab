// Reject unattempted "remaining" actions in freshly added report lines.
const pending=/осталось.{0,50}устранить конфликт|дождаться\s+(?:CI|си)|повторн\w*\s+прогон|\bслить\b/iu;
const evidence=/https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:commit\/[a-f0-9]{40}|actions\/runs\/\d+|pull\/\d+#issuecomment-\d+)/i;
export function violations(diff){
  const lines=diff.split(/\r?\n/),out=[];
  let path='',added=[];
  function flush(){
    for(let i=0;i<added.length;i++){
      const s=added[i];
      if(!pending.test(s)||/^.{0,15}не\s+слить\b/i.test(s))continue;
      const neighborhood=added.slice(i,i+3).join('\n');
      if(!evidence.test(neighborhood))out.push(path+': '+s.trim().slice(0,150));
    }
    added=[];
  }
  for(const line of lines){
    if(line.startsWith('diff --git ')){flush();path=line.split(' b/')[1]||'';}
    else if(line.startsWith('@@ '))flush();
    else if(line.startsWith('+')&&!line.startsWith('+++'))added.push(line.slice(1));
  }
  flush();
  return out;
}
