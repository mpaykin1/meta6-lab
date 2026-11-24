import fs from 'node:fs';
import crypto from 'node:crypto';
import pixelmatch from './vendor/pixelmatch.mjs';
const source=fs.readFileSync(new URL('./vendor/pixelmatch.mjs',import.meta.url));
const blob=crypto.createHash('sha1').update(Buffer.from('blob '+source.length+'\0')).update(source).digest('hex');
if(blob!=='306a868b45dd3187d294f136b135332da63a00bf')throw Error('Pixelmatch upstream blob mismatch');
const [ap,bp,mp,w,h]=process.argv.slice(2);const width=Number(w),height=Number(h);
if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1)throw Error('invalid dimensions');
const a=fs.readFileSync(ap),b=fs.readFileSync(bp),m=fs.readFileSync(mp);const npx=width*height;
if(a.length!==npx*4||b.length!==a.length||m.length!==npx)throw Error('shape mismatch');
let n=0;for(let j=0;j<npx;j++){if(m[j]>=128){n++;continue;}for(let k=0;k<4;k++)a[j*4+k]=b[j*4+k]=k===3?255:0;}
if(!n)throw Error('empty protected mask');
const changed=pixelmatch(a,b,null,width,height,{threshold:.1,includeAA:true});
console.log(JSON.stringify({changed,protected_pixels:n,ratio:changed/n,engine:'Mapbox Pixelmatch 8.0.0',blob}));
