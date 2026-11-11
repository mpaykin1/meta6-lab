// Append-only entry format -> compiled Markdown views. Originals remain live until Claude switches writers.
import {existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
const datasets=[
  ['OSHIBKI','OSHIBKI.md'],['ZADACHI','ZADACHI.md'],['SMENA','SMENA.md'],
  ['progress/JOBS_TABLE','docs/progress/JOBS_TABLE.md'],
  ['progress/MERGE_PROGRESS','docs/progress/MERGE_PROGRESS.md'],
  ['progress/PR54_59_60','docs/progress/PR54_59_60.md'],
];
const validate=process.argv.includes('--validate');
if(!validate&&!process.argv.includes('--write'))throw Error('Specify --validate or --write');
for(const [name,original] of datasets){
  const dir=join('journal/entries',name);
  if(!existsSync(dir))throw Error('Missing journal directory '+dir);
  const names=readdirSync(dir).filter(n=>/\.md$/.test(n)).sort();
  if(!names.length||names[0]!=='0000-header.md')throw Error('Missing source header '+name);
  const joined=names.map(n=>readFileSync(join(dir,n),'utf8')).join('');
  if(!joined.trim())throw Error('Empty journal '+name);
  const target=join('journal/compiled',original);
  if(validate){
    if(existsSync(target)){
      const current=readFileSync(target,'utf8');
      // Compiled copies may lag on PR; they cannot contain unknown replacement records.
      if(!joined.startsWith(readFileSync(join(dir,'0000-header.md'),'utf8')))
        throw Error('Corrupt journal preamble '+name);
      if(!current.trim())throw Error('Empty compiled view '+target);
    }
  }else{
    mkdirSync(dirname(target),{recursive:true});
    if(!existsSync(target)||readFileSync(target,'utf8')!==joined)writeFileSync(target,joined);
    console.log('COMPILED '+target+' entries='+names.length);
  }
}
