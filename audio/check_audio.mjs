#!/usr/bin/env node
// Explicitly requested validator: node audio/check_audio.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {spawnSync} from "node:child_process";
const root=path.resolve(import.meta.dirname,"..");
const audio=path.join(root,"audio");
const errors=[];
const check=(truth,why)=>{if(!truth)errors.push(why);};
const manifest=JSON.parse(fs.readFileSync(path.join(audio,"manifest.json"),"utf8"));
const needs=fs.readFileSync(path.join(audio,"SOUND_NEEDS.md"),"utf8");
const credits=fs.readFileSync(path.join(audio,"CREDITS.md"),"utf8");
const categories=new Set(["combat","creatures","movement","environment","ui","events","office","music"]);
const paths=new Set();
const hashes=new Map();
let total=0;
for(const entry of manifest){
  const {path:rel,category,source,license,author,games,action,duration,size,sha256}=entry;
  check(typeof rel==="string" && /^audio\/library\/[a-z]+\/[a-z0-9_]+\.ogg$/.test(rel),"Bad path: "+rel);
  if(typeof rel!=="string" || rel.includes(".."))continue;
  check(!paths.has(rel),"Duplicate manifest path "+rel);
  paths.add(rel);
  check(categories.has(category) && rel.startsWith("audio/library/"+category+"/"),"Wrong category: "+rel);
  check(/^CC0(?:-1\.0)?$|^CC-BY(?:-4\.0)?$/.test(license??""),"License missing/not allowed: "+rel);
  check(typeof source==="string" && /^https:\/\//.test(source),"Source missing: "+rel);
  check(typeof author==="string" && author.trim(),"Author missing: "+rel);
  check(Array.isArray(games) && games.length>0 || category==="music" && action==="music_ash","Games missing: "+rel);
  if(license?.startsWith("CC-BY"))check(credits.includes(author),"Missing attribution for "+rel);
  const file=path.join(root,rel);
  if(!fs.existsSync(file)){errors.push("File missing: "+rel);continue;}
  const buf=fs.readFileSync(file);
  const sha=crypto.createHash("sha256").update(buf).digest("hex");
  check(buf.subarray(0,4).toString("latin1")==="OggS","Not OGG: "+rel);
  check(!hashes.has(sha),"Duplicate SHA256: "+rel+" == "+hashes.get(sha));
  hashes.set(sha,rel);
  check(sha===sha256,"Hash mismatch: "+rel);
  check(buf.length===size,"Manifest size mismatch: "+rel);
  check(buf.length <= (category==="music" ? 1572864:102400),"Size limit: "+rel);
  total+=buf.length;
  const p=spawnSync("ffprobe",["-v","error","-show_entries","stream=codec_name,sample_rate,channels:format=duration","-of","json",file],{encoding:"utf8"});
  if(p.status!==0){errors.push("ffprobe error "+rel+": "+p.stderr);continue;}
  let probe;
  try {probe=JSON.parse(p.stdout);}catch{errors.push("Bad ffprobe: "+rel);continue;}
  const st=probe.streams?.[0];
  check(st?.codec_name==="vorbis","Not Vorbis: "+rel);
  check(Number(st?.sample_rate)===44100,"Not 44100Hz: "+rel);
  check(Number(st?.channels)===(category==="music"?2:1),"Channel count mismatch: "+rel);
  check(Math.abs(Number(probe.format?.duration)-duration)<.03,"Duration mismatch: "+rel);
}
check(total<=40*1024*1024,"Library exceeds 40MiB: "+total);
for (const category of categories){
  const dir=path.join(audio,"library",category);
  check(fs.existsSync(dir),"Missing directory "+category);
  if(!fs.existsSync(dir))continue;
  for(const filename of fs.readdirSync(dir)){
    check(filename.endsWith(".ogg"),"Non-OGG in library: "+category+"/"+filename);
    check(paths.has("audio/library/"+category+"/"+filename),"Unlisted file: "+category+"/"+filename);
  }
}
let rows=0;
for(const line of needs.split(/\r?\n/)){
  if(!line.startsWith("|") || line.startsWith("|---") || line.includes("| Событие в игре |"))continue;
  const cells=line.split("|").slice(1,-1).map(v=>v.trim());
  if(cells.length!==3)continue;
  rows++;
  const files=[...cells[2].matchAll(/audio\/library\/[a-z]+\/[a-z0-9_]+\.ogg/g)].map(m=>m[0]);
  check(files.length>0,"SOUND_NEEDS missing file: "+cells[0]);
  for(const file of files)check(paths.has(file),"SOUND_NEEDS references missing manifest entry: "+file);
}
check(rows>=75,"Too few SOUND_NEEDS rows: "+rows);
console.log("Audio "+(errors.length?"FAIL":"PASS")+": "+manifest.length+" files, "+rows+" needs, "+categories.size+" categories, "+(total/1048576).toFixed(2)+" MiB");
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
