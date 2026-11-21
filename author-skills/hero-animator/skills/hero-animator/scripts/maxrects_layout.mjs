#!/usr/bin/env node
/**
 * MaxRects Packer build-time geometry bridge, not a web-game runtime dependency.
 * The real MIT-licensed maxrects-packer@3.0.0 is imported from npm; no fake bin
 * packing or artist-art transformations. JSON stdin -> validated JSON stdout.
 */
import { MaxRectsPacker } from 'maxrects-packer';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const fail = message => { throw new Error(`MaxRects: ${message}`); };
const integer = (value, what, minimum = 1) => {
  if (!Number.isSafeInteger(value) || value < minimum) fail(`${what} must be an integer >= ${minimum}`);
  return value;
};
const options = Object.freeze({smart:true,pot:false,square:false,allowRotation:false});

function checkedBins(items, width, height, padding, what) {
  const packer = new MaxRectsPacker(width, height, padding, options);
  packer.addArray(items);
  if (!packer.bins.length || packer.bins.some(bin => !bin.rects.length)) fail(`empty ${what} bins`);
  const seen = new Set();
  const bins = packer.bins.map((bin, index) => {
    const bw=integer(bin.width, `${what} bin ${index} width`), bh=integer(bin.height, `${what} bin ${index} height`);
    if (bw > width || bh > height) fail(`${what} exceeds configured GPU texture bounds`);
    const rects = bin.rects.map(rect => {
      const x=integer(rect.x,`${what} rect.x`,0), y=integer(rect.y,`${what} rect.y`,0);
      const w=integer(rect.width,`${what} rect.width`),h=integer(rect.height,`${what} rect.height`);
      if (rect.rot) fail('sprite rotation is forbidden');
      if (x+w>bw || y+h>bh) fail(`${what} frame outside sheet`);
      if (seen.has(rect.id)) fail(`duplicate ${what} rectangle id: ${rect.id}`);
      seen.add(rect.id);
      return {id:rect.id,x,y,w,h};
    });
    // Prevent accidental overlap even if upstream parameters change.
    for (let i=0;i<rects.length;i++) for (let j=i+1;j<rects.length;j++) {
      const a=rects[i],b=rects[j];
      if (a.x<b.x+b.w && b.x<a.x+a.w && a.y<b.y+b.h && b.y<a.y+a.h)
        fail(`${what} atlas rectangles overlap`);
    }
    return {width:bw,height:bh,rects};
  });
  if (seen.size!==items.length) fail(`unpacked ${what} rectangles`);
  return bins;
}

export function buildLayout(input) {
  const maxWidth=integer(input.maxWidth,'maxWidth');
  const maxHeight=integer(input.maxHeight,'maxHeight');
  const padding=integer(input.padding,'padding',2);
  const clips=Array.isArray(input.clips)?input.clips:fail('clips array required');
  if (!clips.length) fail('no clips');
  const names=new Set(), local=new Map(), clipItems=[];
  for (const clip of clips) {
    if (typeof clip.name!=='string' || !clip.name || names.has(clip.name)) fail('duplicate/missing clip name');
    names.add(clip.name);
    if (!Array.isArray(clip.frames) || !clip.frames.length) fail(`clip ${clip.name} has no frames`);
    const items=clip.frames.map((f,i)=>({
      id:String(i), width:integer(f.width,`${clip.name}[${i}].width`),
      height:integer(f.height,`${clip.name}[${i}].height`)
    }));
    const bins=checkedBins(items,maxWidth,maxHeight,padding,`clip ${clip.name}`);
    if (bins.length!==1) fail(`clip ${clip.name} cannot fit one sheet (required by Hero Animator anims[].sheet); enlarge --max-width/--max-height or reduce frames`);
    const bin=bins[0];
    const packed=new Map(bin.rects.map(r=>[r.id,r]));
    local.set(clip.name,packed);
    clipItems.push({id:clip.name,width:bin.width,height:bin.height});
  }
  const sheets=checkedBins(clipItems,maxWidth,maxHeight,padding,'combined');
  const result={packer:'maxrects-packer@3.0.0',padding,sheets:[],clips:{}};
  for (let i=0;i<sheets.length;i++) {
    const sheet=sheets[i];
    result.sheets.push({width:sheet.width,height:sheet.height});
    for (const block of sheet.rects) {
      const frames=clips.find(c=>c.name===block.id).frames;
      const placements=frames.map((_,j)=>{
        const f=local.get(block.id).get(String(j));
        if (!f) fail(`missing local frame ${block.id}/${j}`);
        return {x:block.x+f.x,y:block.y+f.y,w:f.w,h:f.h};
      });
      result.clips[block.id]={sheet:i,frames:placements};
    }
  }
  if(Object.keys(result.clips).length!==clips.length) fail('not all clips mapped');
  return result;
}

if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    let raw='';
    for await (const piece of process.stdin) raw+=piece;
    const layout=buildLayout(JSON.parse(raw));
    process.stdout.write(JSON.stringify(layout));
  } catch(err) { console.error(err?.message||err);process.exitCode=2; }
}
