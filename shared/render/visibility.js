/* META GAMES shared rendering: conservative camera frustum, WebGL2-safe.
   No GPU extensions or gameplay mutations. */
(function(root){
'use strict';
function frustum(vp,out){
  if(!vp||vp.length!==16)throw new TypeError('Expected column-major 4x4 view-projection matrix');
  const planes=out||[];let count=0;
  // Direct column-major extraction avoids temporary row matrices each frame.
  for(const sign of [1,-1])for(let axis=0;axis<3;axis++){
    const x=vp[3]+sign*vp[axis],y=vp[7]+sign*vp[axis+4],
          z=vp[11]+sign*vp[axis+8],w=vp[15]+sign*vp[axis+12],
          len=Math.hypot(x,y,z);
    if(len>1e-12){
      const p=planes[count]||(planes[count]=[0,0,0,0]);
      p[0]=x/len;p[1]=y/len;p[2]=z/len;p[3]=w/len;count++;
    }
  }
  planes.length=count;return planes;
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
