/* META GAMES shared rendering: conservative camera frustum, WebGL2-safe.
   No GPU extensions or gameplay mutations. */
(function(root){
'use strict';
function frustum(vp){
  if(!vp||vp.length!==16)throw new TypeError('Expected column-major 4x4 view-projection matrix');
  const p=[];
  const rows=[[vp[0],vp[4],vp[8],vp[12]],[vp[1],vp[5],vp[9],vp[13]],[vp[2],vp[6],vp[10],vp[14]],[vp[3],vp[7],vp[11],vp[15]]];
  for(const s of [1,-1])for(const axis of [0,1,2]){
    const a=rows[3],b=rows[axis],x=a[0]+s*b[0],y=a[1]+s*b[1],z=a[2]+s*b[2],w=a[3]+s*b[3],n=Math.hypot(x,y,z);
    if(n>1e-12)p.push([x/n,y/n,z/n,w/n]);
  }
  return p;
}
function sphereVisible(planes,x,y,z,r){
  if(!Number.isFinite(x+y+z+r)||r<0)return true; // invalid bounds: never accidentally hide gameplay
  for(const p of planes)if(p[0]*x+p[1]*y+p[2]*z+p[3]<-r)return false;
  return true;
}
function aabbVisible(planes,min,max){
  if(!min||!max)return true;
  for(const p of planes){
    const x=p[0]>=0?max[0]:min[0],y=p[1]>=0?max[1]:min[1],z=p[2]>=0?max[2]:min[2];
    if(p[0]*x+p[1]*y+p[2]*z+p[3]<0)return false;
  }
  return true;
}
function regionKey(x,z,size){return Math.floor(x/size)+','+Math.floor(z/size)}
function frameBudget({targetMs=16.7,minScale=.65,maxScale=1}={}){
  let ema=targetMs,scale=maxScale;
  return Object.freeze({
    sample(ms){if(!Number.isFinite(ms)||ms<=0)return scale;ema=ema*.95+ms*.05;if(ema>targetMs*1.2)scale=Math.max(minScale,scale-.015);else if(ema<targetMs*.85)scale=Math.min(maxScale,scale+.005);return scale},
    get scale(){return scale},get averageMs(){return ema}
  });
}
root.MetaRender=Object.freeze({frustum,sphereVisible,aabbVisible,regionKey,frameBudget,version:'1.0.0'});
})(typeof window!=='undefined'?window:globalThis);
