// Real sprite-derived visual materials from the user's supplied "Остров сумерек (1)(4).html".
// Tiles retain their original pixel shapes; camera/geometry remain unchanged.
(function(root){
 "use strict";
 const ASSETS={
  tiles:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAQCAYAAADpunr5AAAFkUlEQVR42s1YTUwbRxT+AIsaCJWVTeJSFJMaN+JHVRMpuFJRhdUYohyq9lCaVm2lSKm4lEo9c+yBcyVSNYqE1ENu9JJLkIwjjASHOIliRI2d1ruVHVy81EaLgNqlstqDecPM7K69hEuftMI7b5ad/d6b73tvmt797r1/cWgBfytWomUMh9uQ0Q5oGLpWhdffAt50rQoAGPplF36vm4339nRgIV4Sxmhcze5DtrGr54X7yMMXiK0bmP7mLTix5sSura9z4lvs3v2+rl9pesbut/UC+33a+5qj99+Zvo/YuoHQgAcAoOkVwT8aVKBm94U5ZLF1A838AA96wN8qTObvda2K4XAbAJiAXoiXGi66t6eDLVTNbLNramZNmDc1syb4rS4A0PI7wvXDUq42rmaZn40dzomsFpj/XH9YAJ+CIY/RXKeWK1UaznEBwHjYg7moIQBLoFNQVqJlAIDX34LJCQW375ZYxP1eN8twCggBTPeU/ZpeYT45W/gMUTPbuHW9W/DzO4je9/uG+SPf9LQislrA5atAZLUgjMm2rReQStzGUHhMGH8cjWDks0mkY/eEHbGVipp2DK07tm7Ap7gdJSB9SxNPQXLGr0TLjHpkGrKiIAqG3UutdoeTLKlnH305fqLnv/q8DwCwV8yZfKfO+FgwvF0ek1/fNLD04DkDVA5ArlTBrevddSnIZbcwyngyWQOsTNYCPmvtqMkp19vpQ3PiscDpnbGfbZ/fDX1s0oS9YrvtfAoK7Y5cMs58vsEgfIPA0oPnltoGwLSDZQsNeGoB4KmGbHJCwVzUsKSjgL8VulYWQOe3FYFvl/mjQYWNRR6+EObb2ex8XsigqZk1hAY8uFhpqulXsYzLahZvA/jj142joK0WcHP8CpYXk+g8P4SzhzpAdsFB4CkQvsEg2xGnvbmGzy3ESxgNKvWLCF2rIqMdMEohepHB53eEvDso0zW9wsAkgK2ygw8Iv1P4q142kT709nQgUywjUzxaz/JiUhDkwJk2LC8mhYDQM/RcKpE2vU8eSyXS2CvmsFfMof9SH05qsXXjSAOsykwr44NEduPPf0xcbyWasuD+XzTg02vtx5p/rj8sCPGd6fsCqLIIUxkqCzBpgguAUPnIpSjdE/gUKOY7DIAdjdgBT9RFdESCdVwbad08FufLfQDwjAGbjt2DvmnA2+Wx7QN48GVQQwMe4Xut6Efe3S5dqyLgt673ZWqSRXo43AY8EgH2vPMJVHUDxtMFR2I9O58XskbmejmYcpU18jrw09wT3By/InC/lt+x5Hz2bYeaoQSo5q+Vm1TtUInZF/rCEvR6oB5HA1zD4bYjMG0oh+bIVdFKtIwpLvMJfADIt/ei+y+VZbhdecpnjZrdN21hPqN4uqL/t7yYNPG8UDlZ1P5yH8ALrECPybipD6inEy/ViGW0A0YrGe2A7QAa5wWY1wlq3lDgRDj+I155YxAA8NuTp/i7TlPCc6EsTHYL9ylu5qO/njoasKVu4NUPP7DPXHUDp7wGhsJjln0ABSWXjGNbLzB6YknY5Xlp7aFd7uIphTpcHmhqxnStKjRjVCXxpWcNVJUByfO8VYmq6ZWGfUCjsyG5D2jE+bL/wrURS/Cp/Ewl0lyXHDcFB3hk+z4rTZPPxFw81cjgU9bLAizohaQBml6BT3Gz44l6NhpU2HmO09pf/qjI0ia+HvHVjh7UrInz5zM7df2N+oD+S31oP3sRW6moQFM0ZnfGJWsAVT2WIiyDSuLr9bccUY2NEN+Qanm/12067+HPiuQFWAWJ5shnQ/IH9PZ0mM54ZM5v5H/fpsRMJdKs3qcxfqfwv+3AddILuORs58HnqaZRFWCX7fxhHAWDgjMaVDA7n3e0WKt5sXVD6ANUB5wv+62ApsyvZ/xzJ7H/AAOnxjkh2x6sAAAAAElFTkSuQmCC",
  hero:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAYCAYAAAAF6fiUAAAD9UlEQVR42u1ZTUhUURT+3jgwopXRWwhPYTL1GVhExJgg6KKmpX8QgqtJAhfugxa6EXLVJogIQmYltLFy0SIjmSFhcCgQFHL8faFPIkfwZ2Qs6LUY75v7rvf9zPhUZDwwMHPvnPOd755z/84FzuVcClmE4zAqibLGa1eTCeEkSJ0lfMFtApIoa6HGMgBAtb9Ub19UUgjHthzbKBR8wU0CtC6Ro9goBHzBLQKSKGvNVT4AwLXyYssssbJRaPge1sDSr7Thz4tKSv8AQKixzHSKEmFtEOkf6ENfW4tp9hQivtfMAC+K/QN92JyeQTg2xl0fo8hmQbNUjpuB63p/4OkY+qZnHG1ihYTvPQ4Codt+gy4r8aFWBJ6OafRULlR8r1sEaBKAghBgsBEfatWJ2J0o8sUHgOjyPs4SvulmYuaEFQGyNnZrPrRcLDX03agoRtOcanuUywef4E7WSZhZSyOykzoz+F7WyOsLVxBZSuHv7w18//TVEQFaFwAiO6lDjr/8kbS99kmirOWKL4myRgLeNKeiW/NxbTvFB4DKJZwYvkATpwePjWBkJ4URYd/Sgd7dTb398qPn2FMWUOKvwZ6ygLQyD8/iZ9MM1Ac/R3x64NRkQiDfc8HnJZBb+EQmg2v6DKJteMkA6oN30PXx4TODAUKAt/uPiLI2spt1zu6YxiOg+8DgswNod0OlByEXbEMCCfnjA8C/6vuG/hJ/DZrGgT9fXh36r0dNJgQSWdLJRo82zCNH67IyLkeQVuYtB4H2gSVABqHYX5tXXcYOn2D37m5a8nAazOFO2RAoOoC2xThJlDWyWwcTLXoQiHL41k/0jCYcbWRXL2XjNPmhCk1ty1jZFmyv8sOdMnpGE4YkSCvz+Pa4hDuF3cSn9Qn+ZHANd97sZbLVYglllyOn+MJRDZg5UR9ogFQpZbLw3fucillu4Ac72qGuqgCA2fhUTtVQNwJYH2jIfLcZAy9vSkqirJXW3dUNhF4AK9srRyrnOtUl+LX3OjK/V1U8eHJy+ETc5h/saCeBMNwfvOdPIu6/BZDsn41PYTZuDAArHjsDZOoEO9odnW5o/XwJUNmiLx/1gQbH+GZkT0NItlesT6BifcK8FkSLuDFt+M1TtLpFYX4hTYLmFxhRkn/e6RX47NQAnHdWIxgIwWpdWt3FY3EE/F7WF4/FhV/A70XTphLdfB+N30ClPe12gXASlbZbsMpcJPzvcqs5TYRkupsPL9jLpUF+waMX7SkWUP/ORhuC6/YIfi3neyJCelJW7sDKeGhZPKAgdPp3TAERdWKJwjpuz+kF2989jklPDBZ7MR56wioEUFVJ4duvv0MyPIu2Q2s1z/qUOcSuvwB7VXqxc/89dpy9GAYAhP25ATty7U3Dvls7nsN05x8z9psAYE2NG1/1fyBIrK8nKaxWP9sa3Hr08gHNsCqeucZPYT/mYy2CWh/y30ZchrVtN2omwmmXrIYeecnCAMjyGxLUN/c5UPUdjbCTN6TvF5Qa8omnNsI1sLM2a/mkwI4dhBO/Oe4LFygg3GopLCYJdk+WQXXT58Www1llnq8YRg8Xyywuc9mDRX+Sz1nCShUw7kLsErVPLaTY+hVjfLXI5zueqdNr7dTd7th/3/gJtR5LK992wAAAAASUVORK5CYII=",
  water:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAACm53kpAAACIUlEQVR42tVXLW/CQBh+uqDwtXQJKIKbQi1pgt3UsoUfQIKZwvEjlmBICJoMCfhaFGIJshVX22QS26kjb6/38V63Jdup9prnnveevp9Bf3Yow24HADAchDieCwBAkeXwWQ+PdwCA/e6EJkva4MtL+d8XWwBAO+qxcUF/digB4CLS2sd21EPY7WA4CAEAx3OBIstrxobdTuVZJEnFEFUcm1jUDomnfDp7XHgb/1UAnQjyALlvU9YmoE4ozhkmPpM9HLxqz43tAvQgrlttVtPKe5HluIgUF5F6Xd62dPZw8UWWYz0fXe2peYDrojaV/yM+uH16KynIFmMmlVVSU4xz8aaE+Bv8wf3yozQRRXFcEUMmt81qiv35EwDwvthCFZDGmMTvdyes5yOMJ0sAwMvrsxZvqw70AlEcAwBEkljxVAyKl/y1KkATXzvqaffpiuK4YhzFyG9UmItIEcVxrVKY+OmiAroStSkctCHgSjg+McU9x4XbrKYYT5bf5nfhW+oGdc0mTQ51TVoK1Zg2eZTkp3+ay68LWVffEPRnh5K6rDRcPuvc2OcvcMrnT+Clx+jwtj7mKoDuAFsjZEouXONNyY2Ll/w0OXPx1CtaYbcDIVJrvKmupR4mGJ0iFaxSHTRh4TMrFEw85S+yHEfVA7htrs4rXHg5H9DWWA07Dj+dDdT+xAevHYY4MeozZbkEbIJXuz7fHOMU4C+MtE35XdnetL4ABT3ujEkQefgAAAAASUVORK5CYII="
 };
 const original=root.IslandOriginalAssets;
 if(original){ASSETS.atlas=original.atlas;ASSETS.weapons=original.weapons;ASSETS.hero=original.hero;ASSETS.water=original.water;}
 const imgs={};
 let ready=0,loads=0;
 Object.entries(ASSETS).forEach(([key,url])=>{
  const im=new Image();im.onload=()=>{ready++;};im.onerror=()=>{loads++};im.src=url;imgs[key]=im;
 });
 const ok=k=>imgs[k]?.complete&&imgs[k].naturalWidth>0;
 function picture(ctx,key,sx,sy,sw,sh,x,y,w,h){
  if(!ok(key))return false;
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.drawImage(imgs[key],sx,sy,sw,sh,x,y,w,h);ctx.restore();return true;
 }
 function tile(ctx,index,x,y,size,alpha=.8){
  const full=ok("atlas"),small=ok("tiles");
  if(!full&&!small)return false;
  ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;
  if(full){const row=Math.floor(index/4),column=index%4;
    ctx.drawImage(imgs.atlas,column*16,row*16,16,16,x,y,size,size);
  }else ctx.drawImage(imgs.tiles,(index%6)*16,0,16,16,x,y,size,size);
  ctx.restore();return true;
 }
 function environment(ctx,cam,w2s,t,W,H){
  if(!ok("tiles")&&!ok("atlas"))return;
  // Bounded, original pixel-tile grass patches. World anchor follows unchanged camera.
  for(let i=0;i<54;i++){
   const wx=((i*173)%1100)-540,wy=((i*71+Math.floor(i/7)*163)%650)-305,p=w2s(wx,wy);
   if(p.x<-30||p.x>W+30||p.y<-30||p.y>H+30)continue;
   tile(ctx,i%9?0:4,p.x-7*cam.zoom,p.y-9*cam.zoom,14*cam.zoom,i%4===0?.35:.18);
  }
  if(!ok("water"))return;
  // Original 4-frame 16px water sprites laid along the existing river, not new geometry.
  for(let i=-5;i<=5;i++){
   const wx=i*110,wy=Math.sin(i*.64)*45+120,p=w2s(wx,wy);
   if(p.x<-25||p.x>W+25||p.y<-25||p.y>H+25)continue;
   const frame=(Math.floor(t/210)+i+20)%4;
   picture(ctx,"water",16*frame,0,16,16,p.x-12*cam.zoom,p.y-8*cam.zoom,24*cam.zoom,12*cam.zoom)
  }
 }
 const SKINS={hut:[2,24,14],settlement:[2,24,14],school:[3,34,22],
  market:[2,34,10],castle:[1,46,30],monastery:[1,38,23],prison:[1,38,26],
  granary:[2,36,20],healer:[2,29,17]};
 function decorate(ctx,o,w2s,cam){
  const detail=SKINS[o.kind];if(!detail||o.dead||(!ok("tiles")&&!ok("atlas")))return;
  const [index,w,h]=detail,q=cam.zoom,p=w2s(o.x,o.y),width=w*q;
  // Material detail clipped to the near-facing wall. Original silhouette untouched.
  ctx.save();ctx.beginPath();
  ctx.moveTo(p.x-width*.49,p.y-h*q*.2);
  ctx.lineTo(p.x+width*.02,p.y+width*.07);
  ctx.lineTo(p.x+width*.02,p.y+width*.07-h*q*.88);
  ctx.lineTo(p.x-width*.49,p.y-h*q*.2-h*q*.88);
  ctx.closePath();ctx.clip();ctx.globalAlpha=.46;ctx.imageSmoothingEnabled=false;
  const step=Math.max(5,8*q),y0=p.y-h*q*1.5;
  for(let x=p.x-width*.55;x<p.x+width*.6;x+=step)for(let y=y0;y<p.y+width*.13;y+=step){
   if(ok("atlas"))ctx.drawImage(imgs.atlas,(index%4)*16,Math.floor(index/4)*16,16,16,x,y,step+1,step+1);
   else ctx.drawImage(imgs.tiles,(index%6)*16,0,16,16,x,y,step+1,step+1)
  }
  ctx.restore();
  // A 2D faceted material highlight keeps the existing world scale and depth.
  if(o.kind==="castle"||o.kind==="monastery"){
   const roofY=p.y-h*q-9*q;
   tile(ctx,1,p.x-6*q,roofY,10*q,.32)
  }
 }
 function apngFrame(ctx,x,y,w,h){
  const anim=root.ObserverAPNG?.image;
  if(!anim||!anim.complete||anim.naturalWidth!==24||anim.naturalHeight!==24)return false;
  ctx.drawImage(anim,x,y,w,h);
  return true;
 }
 function human(ctx,o,red,w2s,cam,t){
  if(!ok("hero"))return false;
  const p=w2s(o.x,o.y,14),q=cam.zoom,frame=o.dead?0:Math.floor(t/225+(o.id||0))%4,scale=q*.95;
  ctx.save();ctx.translate(p.x,p.y);if(o.dead){ctx.rotate(Math.PI/2);ctx.globalAlpha=.65}
  if(!apngFrame(ctx,-12*scale,-10*scale,24*scale,24*scale))picture(ctx,"hero",frame*24,0,24,24,-12*scale,-10*scale,24*scale,24*scale);
  if(red){ctx.fillStyle="rgba(209,51,45,.78)";ctx.beginPath();ctx.moveTo(-4*q,-4*q);ctx.lineTo(-9*q,13*q);ctx.lineTo(5*q,12*q);ctx.closePath();ctx.fill()}
  ctx.restore();return true
 }
 function fighter(ctx,a,w2s,cam,t){
  if(!ok("hero"))return false;
  const p=w2s(a.x,a.y,13),q=cam.zoom,dir=a.dir||1,phase=a.state==="chase"?160:400,frame=Math.floor(t/phase+a.seed)%4;
  ctx.save();ctx.translate(p.x,p.y);
  if(a.state==="dead"){ctx.rotate(Math.PI/2);ctx.globalAlpha=.67}
  if(a.state==="wounded")ctx.rotate(-.22*dir);
  if(!apngFrame(ctx,-11*q,-10*q,22*q,22*q))picture(ctx,"hero",frame*24,0,24,24,-11*q,-10*q,22*q,22*q);
  const badge={guard:"#a5c0d7",militia:"#d5a071",guild:"#dfbe69",zealot:"#aa87a8",rebel:"#e8756c",house:"#adbbbf",scholar:"#bcb49c"};
  ctx.fillStyle=badge[a.faction]||"#e2c49f";ctx.fillRect(-4*q,-1*q,5*q,3*q);
  if(a.armed&&a.state!=="dead"){
   const ang=(-.66+(a.state==="attack"?Math.sin(a.attack*Math.PI)*1.25:0))*dir;
   ctx.save();ctx.translate(7*q,3*q);ctx.rotate(ang);
   const meta=original?.wmeta?.weapons?.sword?.cell;
   if(ok("weapons")&&meta){
     ctx.imageSmoothingEnabled=false;
     // Original sword cell from the exact 21-weapon sprite atlas.
     ctx.drawImage(imgs.weapons,...meta,-2*q,-7*q,17*q,17*q);
   }else{
     ctx.strokeStyle="#f0e9d3";ctx.lineWidth=2*q;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(14*q*dir,0);ctx.stroke();
     ctx.fillStyle="#7b5e39";ctx.fillRect(-3*q,-2*q,5*q,4*q);
   }
   ctx.restore();
  }
  if(a.hp<100&&a.state!=="dead"){
   ctx.fillStyle="rgba(0,0,0,.7)";ctx.fillRect(-10*q,-15*q,20*q,3*q);
   ctx.fillStyle=a.hp<45?"#c54a43":"#c7af67";ctx.fillRect(-10*q,-15*q,20*q*Math.max(0,a.hp)/100,3*q);
  }
  if(a.hitFlash>0){ctx.fillStyle="rgba(255,84,67,"+Math.min(.45,a.hitFlash*2)+")";ctx.fillRect(-9*q,-12*q,18*q,20*q)}
  ctx.restore();return true
 }
 function info(){return{loaded:ready,failed:loads,source:"exact original user-uploaded Island of Twilight expanded atlas",tiles:original?.atlasNames?.length||6,weapons:Object.keys(original?.wmeta?.weapons||{}).length,apngFrames:root.ObserverAPNG?.frames||0,heroFrames:4,waterFrames:4,scale:"unchanged Observer World camera zoom"}}
 function heldWeapon(ctx,id,wx,wy,w2s,cam,attack=0){
  const m=root.IslandOriginalAssets?.wmeta?.weapons?.[id]?.cell;
  if(!ok("weapons")||!m)return false;
  const q=cam.zoom,p=w2s(wx,wy,13);
  ctx.save();ctx.translate(p.x+7*q,p.y+3*q);
  ctx.rotate(-.7+Math.sin(attack*Math.PI)*1.1);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(imgs.weapons,...m,-2*q,-7*q,16*q,16*q);
  ctx.restore();return true;
 }
 function waterTile(ctx,x,y,w,h,frame){
 return picture(ctx,"water",16*(frame%4),0,16,16,x,y,w,h);
}
root.IslandVisuals=Object.freeze({environment,decorate,human,fighter,heldWeapon,info,tile,waterTile,apngFrame});
})(window);
