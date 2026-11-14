import {spawnSync} from 'node:child_process';

// Git cat-file exits 128 for a missing path; ls-tree is a reliable read-only probe.
// Unavailable git revision is an error, not proof that the game is new.
export function baseGameExists(id,run=spawnSync){
 if(typeof id!=='string'||!/^[a-z0-9-]+$/.test(id))
  throw Error('нет данных: invalid new-game id');
 const expected='games/'+id;
 const result=run('git',['ls-tree','-d','--name-only','origin/main','--',expected],{encoding:'utf8'});
 if(result?.error)throw result.error;
 if(result?.status!==0||typeof result.stdout!=='string')
  throw Error('нет данных: cannot read base game tree (status '+result?.status+')');
 const paths=result.stdout.trim().split('\n').filter(Boolean);
 if(paths.length===0)return false;
 if(paths.length===1&&paths[0]===expected)return true;
 throw Error('нет данных: unexpected base game path');
}
