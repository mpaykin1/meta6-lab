// Build the sitemap only after the production pages have been published.
import { readdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const base = 'https://mpaykin1.github.io/meta6/killklan/';
const attr = (tag, key) => tag.match(new RegExp('\\b'+key+'\\s*=\\s*["\\\']([^"\\\']*)["\\\']','i'))?.[1];
const canonical = html => [...html.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]).find(t=>attr(t,'rel')?.toLowerCase()==='canonical');
const robots = html => [...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]).filter(t=>['robots','googlebot','bingbot'].includes(attr(t,'name')?.toLowerCase())).map(t=>attr(t,'content')||'').join(',');
const title = html => html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();
async function walk(dir) {
  const out = [];
  for(const e of await readdir(dir,{withFileTypes:true})){
    if(e.name.startsWith('.')||e.name==='tools')continue;
    const p=join(dir,e.name);
    if(e.isDirectory())out.push(...await walk(p));
    else if(e.name==='index.html')out.push(p);
  }
  return out;
}
const urls=[];
for(const path of await walk(root)){
  const html=await readFile(path,'utf8');
  const url=new URL(relative(root,path).split(sep).join('/').replace(/index\.html$/,''),base).href;
  if(attr(canonical(html)||'','href')!==url||/\b(noindex|none)\b/i.test(robots(html)))continue;
  const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000)});
  if(response.status!==200||!response.headers.get('content-type')?.includes('text/html'))throw Error('Production unavailable: '+url+' '+response.status);
  const live=await response.text();
  if(attr(canonical(live)||'','href')!==url||/\b(noindex|none)\b/i.test(robots(live))||/\b(noindex|none)\b/i.test(response.headers.get('x-robots-tag')||'')||title(live)!==title(html))throw Error('Production SEO not deployed: '+url);
  urls.push(url);
}
if(!urls.includes(base)||!urls.includes(base+'music/')||!urls.includes(base+'music/en/'))throw Error('Missing required canonical pages');
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.sort().map(u=>'  <url><loc>'+escape(u)+'</loc></url>').join('\n')+'\n</urlset>\n';
const output=join(root,'sitemap.xml');
await writeFile(output+'.tmp',xml);
await rename(output+'.tmp',output);
console.log('Sitemap: '+urls.length+' verified production URLs');
