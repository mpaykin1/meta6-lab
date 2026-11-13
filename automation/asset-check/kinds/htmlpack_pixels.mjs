export function features(on0, on1, off0, off1, fps) {
  const w=on1.width,h=on1.height,c=on1.channels, n=w*h;
  if ([on0,off0,off1].some(x=>x.width!==w||x.height!==h||x.channels!==c))
    throw Error('HP10: mismatched isolation frames');
  const masks=[new Uint8Array(n),new Uint8Array(n)];
  const ons=[on0,on1],offs=[off0,off1];
  const sums=[{x:0,y:0,n:0},{x:0,y:0,n:0}];
  const rgbDistance=(a,ai,b,bi)=>(
    Math.abs(a[ai]-b[bi])+Math.abs(a[ai+1]-b[bi+1])+Math.abs(a[ai+2]-b[bi+2]))/3;
  for(let k=0;k<2;k++){
    const on=ons[k].data,off=offs[k].data;
    for(let y=2;y<h-2;y+=2)for(let x=2;x<w-2;x+=2){
      const p=y*w+x,i=p*c;
      if(rgbDistance(on,i,off,i)<23)continue;
      masks[k][p]=1;sums[k].x+=x;sums[k].y+=y;sums[k].n++;
    }
  }
  const active=masks[1],shown=on1.data;
  const signal=ons.map((on,k)=>Float64Array.from(on.data,(v,i)=>v-offs[k].data[i]));
  const count=sums[1].n;
  if(!count)return {visible:0,detail:0,motion:0,deformation:0,isolated:0,silhouette:0,
    colors:0,fps:Math.round(fps),palette:[0,0,0]};
  const center=[sums[1].x/count,sums[1].y/count];
  const radii=new Float64Array(24),touched=new Uint8Array(24);
  let edgeCount=0,shapeBoundary=0,validMotion=0,motionPixels=0;
  const colors=new Set(),rgbMean=[0,0,0];
  const dx=sums[0].n?2*Math.round(((sums[0].x/sums[0].n)-center[0])/2):0;
  const dy=sums[0].n?2*Math.round(((sums[0].y/sums[0].n)-center[1])/2):0;
  for(let y=2;y<h-2;y+=2)for(let x=2;x<w-2;x+=2){
    const p=y*w+x;if(!active[p])continue;
    const i=p*c,r=shown[i],g=shown[i+1],b=shown[i+2];
    colors.add(((r>>4)<<8)|((g>>4)<<4)|(b>>4));
    rgbMean[0]+=r;rgbMean[1]+=g;rgbMean[2]+=b;
    const neighbors=[p-2,p+2,p-2*w,p+2*w];
    if(neighbors.some(q=>!active[q])){
      shapeBoundary++;
      const phi=Math.atan2(y-center[1],x-center[0]);
      const bin=Math.min(23,Math.floor(((phi+Math.PI)/(2*Math.PI))*24));
      radii[bin]=Math.max(radii[bin],Math.hypot(x-center[0],y-center[1]));
      touched[bin]=1;
    }
    // Count texture edges ONLY where both adjacent samples belong to the object.
    for(const q of [p+2,p+2*w]){
      if(active[q] && Math.min(rgbDistance(shown,i,shown,q*c),
          rgbDistance(signal[1],i,signal[1],q*c))>17)edgeCount++;
    }
    const prevX=x+dx,prevY=y+dy;
    if(prevX>=2&&prevX<w-2&&prevY>=2&&prevY<h-2){
      const prev=prevY*w+prevX;
      if(masks[0][prev]){
        validMotion++;
        if(Math.min(rgbDistance(on0.data,prev*c,shown,i),
            rgbDistance(signal[0],prev*c,signal[1],i))>19)motionPixels++;
      }
    }
  }
  // HP12: compare silhouette masks after cancelling motion of the entire object.
  // Pulsating light and color cannot impersonate animation of articulated parts.
  let differentShape=0,unionShape=0;
  for(let y=2;y<h-2;y+=2)for(let x=2;x<w-2;x+=2){
    const now=Boolean(masks[1][y*w+x]);
    const px=x+dx,py=y+dy;
    const before=px>=2&&px<w-2&&py>=2&&py<h-2&&Boolean(masks[0][py*w+px]);
    if(now||before){unionShape++;if(now!==before)differentShape++;}
  }
  const deformation=differentShape/Math.max(1,unionShape);
  const rad=Array.from(radii).filter((v,i)=>touched[i]);
  const avg=rad.reduce((x,y)=>x+y,0)/Math.max(1,rad.length);
  const varR=rad.reduce((x,y)=>x+(y-avg)**2,0)/Math.max(1,rad.length);
  // Regular circles, tori and hexagons have low angular silhouette variation.
  const silhouette=rad.length>=12?Math.sqrt(varR)/Math.max(1,avg):0;
  return {visible:+(count/(n/4)).toFixed(5),
    detail:+(edgeCount/Math.max(1,count*2)).toFixed(5),
    motion:+(motionPixels/Math.max(1,validMotion)).toFixed(5),
    deformation:+deformation.toFixed(5),
    silhouette:+silhouette.toFixed(5),
    colors:colors.size, fps:Math.round(fps),
    isolated:+(count/(n/4)).toFixed(5),
    palette:rgbMean.map(v=>Math.round(v/count)),
    boundary:shapeBoundary};
}

