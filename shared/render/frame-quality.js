/* META GAMES quality regulator: conservative, reversible DPR adjustment.
   Only acts after sustained GPU/CPU frame-time pressure; never touches gameplay. */
(function(root){
'use strict';
function create({targetMs=16.67,minScale=.80,maxScale=1}={}){
 let moving=targetMs,scale=maxScale,counter=0,slow=0,fast=0;
 function sample(ms){
  if(!Number.isFinite(ms)||ms<=0)return scale;
  ms=Math.min(ms,1000);
  moving=moving*.95+ms*.05;
  if(++counter%30!==0)return scale;
  if(moving>targetMs*1.35){slow++;fast=0}
  else if(moving<targetMs*.86){fast++;slow=0}
  else slow=fast=0;
  if(slow>=2){scale=Math.max(minScale,Math.round((scale-.10)*100)/100);slow=0}
  if(fast>=3){scale=Math.min(maxScale,Math.round((scale+.05)*100)/100);fast=0}
  return scale;
 }
 return Object.freeze({sample,get scale(){return scale},get averageMs(){return moving}});
}
root.MetaQuality=Object.freeze({create,version:'1.0.0'});
})(typeof window!=='undefined'?window:globalThis);
