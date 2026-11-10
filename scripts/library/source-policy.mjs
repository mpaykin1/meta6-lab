import path from 'node:path';

const bannedSegment=/^(?:lib|libs|vendor|node_modules|external|third[-_]party|dist|packages)$/i;
const bannedName=/^(?:three(?:\.module)?|playgama-bridge|babylon|pixi|jquery|react|vue)(?:[.-][\w-]+)*\.(?:js|mjs|cjs)$/i;
const bundledName=/(?:\.min|\.bundle|\.umd)\.(?:js|mjs|cjs)$/i;
const thirdPartyHeader=/@license|SPDX-License-Identifier|three\.js\s+r\d+|Copyright\s+\d{4}.*(?:three|mozilla|google|facebook|adobe|microsoft|contributors)/i;

export function isOriginalGameSource(sourcePath,source){
 if(typeof sourcePath!=='string'||typeof source!=='string')return false;
 const parts=sourcePath.replaceAll('\\','/').split('/');
 if(parts.some(x=>x==='..'||bannedSegment.test(x)))return false;
 const name=parts.at(-1);
 if(!name||bannedName.test(name)||bundledName.test(name))return false;
 if(thirdPartyHeader.test(source.slice(0,4096)))return false;
 const lines=source.split('\n');
 // Some original games embed long base64 textures inside otherwise readable HTML.
 // Reject minified/vendor-like whole files, not original games with isolated data lines.
 const nonempty=lines.filter(x=>x.trim());
 const average=nonempty.length?nonempty.reduce((n,x)=>n+x.length,0)/nonempty.length:0;
 if(average>600)return false;
 if(lines.some(line=>line.length>8000)&&average>180)return false;
 return true;
}

export function codeSourceType(relative){
 const ext=path.extname(relative).toLowerCase();
 return new Set(['.js','.mjs','.cjs','.ts','.html','.htm','.glsl','.vert','.frag']).has(ext);
}

export const MIN_SYSTEM_LINES=25;
