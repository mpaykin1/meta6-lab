// Source-only transfers generate and validate a catalog in CI, but publish it
// through the dedicated library-machine-sync PR after the source reaches main.
export function validateSourceOnly(diff,baseHasGame=()=>false){
 const lines=String(diff||'').trim().split('\n').filter(Boolean);
 if(!lines.length)throw Error('Source-only PR has no changed files');
 const games=new Set();
 let archives=0;
 for(const line of lines){
  const fields=line.split('\t');
  if(fields.length!==2)throw Error('Unexpected git --name-status record');
  const [status,path]=fields;
  if(status!=='A')throw Error('Source-only PR must only add files: '+path);
  const game=/^games\/([a-z0-9-]+)\/[^/].*/.exec(path);
  if(game){games.add(game[1]);continue}
  if(/^reference-archives\/[a-zA-Z0-9._-]+\.zip$/.test(path)){archives++;continue}
  throw Error('Source-only PR contains unrelated file: '+path);
 }
 if(games.size!==1)throw Error('Source-only PR must add one game');
 if(archives>1)throw Error('Source-only PR must not bundle archives');
 const id=[...games][0];
 if(baseHasGame(id))throw Error('Source-only PR changes an existing game: '+id);
 return {game:id,sourceFiles:lines.length};
}
