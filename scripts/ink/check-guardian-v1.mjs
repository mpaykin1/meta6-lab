// OWNER PASS v1: lock immutable blobs independently of editable reference metadata.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';

export const PINNED = Object.freeze({
  'demos/living-watercolor/ink-fallen-robot.js':'5caaa7f896d57bdf19c99462f6f492c3d41956a9',
  'demos/living-watercolor/ink-forest.js':'e85119cb46263ac1ca32fc0d300850173d36451b',
  'demos/living-watercolor/ink-objects.js':'1c504dbbe29233b8034cd472e869d2b62d0cd0f3',
  'demos/living-watercolor/index.html':'49213b2bba813ae8ad4ab708a8845557dd8cb367',
  'demos/living-watercolor/ink-entry.js':'ab2f686d747597acaeb602ec16a63774bf22a4cc',
  'demos/living-watercolor/shared/living-watercolor-3d.js':'1286ca7b6641f7b6ca9aa6cfe319d6c4c0c98bf6',
  'demos/living-watercolor/shared/living-watercolor-generators.js':'32d6952209f419058b460c171d5ca6dab092416e',
});

export function gitBlobSHA(content){
  return crypto.createHash('sha1').update(Buffer.from('blob '+content.length+'\0'))
    .update(content).digest('hex');
}
export function verifyGuardian(root=process.cwd()){
  const errors=[];
  const passportPath=path.join(root,'shared/references/ink-fallen-guardian.json');
  let passport;
  try{passport=JSON.parse(fs.readFileSync(passportPath,'utf8'));}
  catch(e){throw Error('INK guardian passport missing or invalid: '+e.message);}
  if(passport.status!=='OWNER_PASS'||passport.id!=='ink-fallen-guardian')
    errors.push('Lost OWNER_PASS guardian passport');
  const entries=new Map((passport.source?.files||[]).map(v=>[v.path,v.git_blob_sha]));
  for(const [file,expected] of Object.entries(PINNED)){
    if(entries.get(file)!==expected)errors.push(file+': passport SHA changed');
    const full=path.join(root,file);
    try{
      const actual=gitBlobSHA(fs.readFileSync(full));
      if(actual!==expected)errors.push(file+': accepted v1 blob changed: '+actual);
    }catch(e){errors.push(file+': missing: '+e.message);}
  }
  if(errors.length)throw Error('INK OWNER PASS guard FAIL\n'+errors.join('\n'));
  return Object.keys(PINNED).length;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  console.log('INK_GUARDIAN_V1_SHA_PASS '+verifyGuardian());
}
