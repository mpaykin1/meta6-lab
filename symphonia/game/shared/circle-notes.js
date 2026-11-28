// Musical notation is world-space only; emitted by the existing piano motif.
export function createCircleNotes(THREE,scene,circle){
 if(circle<2)return {emit(){},tick(){},reset(){},get count(){return 0;}};
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,128,128);
 ctx.font='96px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#c9d9f4';ctx.fillText('♪',64,64);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const pool=Array.from({length:12},()=>{const mat=new THREE.SpriteMaterial({map:tex,color:0xb7d8ff,transparent:true,opacity:0,depthWrite:false,fog:true});const sprite=new THREE.Sprite(mat);sprite.visible=false;scene.add(sprite);return {sprite,age:9,phase:0};});
 let index=0;const origin=new THREE.Vector3();
 function reset(){for(const p of pool){p.age=9;p.sprite.visible=false;}index=0;}
 function emit(m,position){const p=pool[index++%pool.length];p.age=0;p.phase=(m%12)/12*Math.PI*2;origin.copy(position);p.sprite.position.copy(origin).add(new THREE.Vector3(Math.sin(p.phase)*2.8,1.5+((m%12)/12)*1.5,Math.cos(p.phase)*2.8));p.sprite.scale.set(.65,.65,1);p.sprite.material.opacity=0;p.sprite.visible=true;}
 function tick(dt,active){for(const p of pool){if(!p.sprite.visible)continue;if(!active){p.sprite.visible=false;continue;}p.age+=dt;if(p.age>=4.4){p.sprite.visible=false;continue;}p.sprite.position.y+=dt*.52;p.sprite.position.x+=Math.sin(p.phase+p.age)*dt*.15;p.sprite.material.opacity=.66*Math.min(1,p.age/.35,Math.max(0,(4.4-p.age)/1.5));}}
 return {emit,tick,reset,get count(){return pool.filter(p=>p.sprite.visible).length;}};
}
