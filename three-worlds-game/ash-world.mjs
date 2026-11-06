import {createAshFactory} from './ash-assets.mjs';
import {hash,clamp} from './world-core.mjs';
export const ashWeight=x=>clamp((-x-40)/40,0,1);
export function syncAshFog(scene,fogUniform,weight){
 scene.fog.density=Math.max(scene.fog.density,.016*weight);
 fogUniform.value=scene.fog.density;
}
export function createAshWorld({THREE,scene,player,terrainHeight,skyU,fogUniform,seed,getBiome=()=>null,sea=3.8}){
 let factory=null,last='',clock=0;const groups=new Map(),bounds=[];
 const geo=new THREE.BufferGeometry(),data=new Float32Array(180*3);
 for(let i=0;i<180;i++){data[i*3]=(hash(i,1,seed)-.5)*40;data[i*3+1]=hash(i,2,seed)*18;data[i*3+2]=(hash(i,3,seed)-.5)*40}
 geo.setAttribute('position',new THREE.BufferAttribute(data,3));
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},strength:{value:0}},vertexShader:'uniform float time; varying float fade; void main(){vec3 p=position;p.x+=sin(time*.4+p.z)*2.;p.y=mod(p.y-time*.9,18.);vec4 v=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*v;gl_PointSize=clamp(22./max(1.,-v.z),1.,4.);fade=.4+.3*sin(p.x);}',fragmentShader:'uniform float strength; varying float fade;void main(){if(length(gl_PointCoord-.5)>.5)discard;gl_FragColor=vec4(.8,.55,.39,fade*strength);}'});
 const ash=new THREE.Points(geo,mat);ash.frustumCulled=false;ash.visible=false;scene.add(ash);
 function isAshLand(x,z){return (x<-40||getBiome(x,z)==='ash')&&terrainHeight(x,z)>sea+.12}
 function remove(g){scene.remove(g);g.traverse(o=>{if(o.material)o.material.dispose()})}
 function update(dt){clock+=dt;const weight=player.pos.x>=64&&isAshLand(player.pos.x,player.pos.z)?1:ashWeight(player.pos.x);ash.visible=weight>0;mat.uniforms.time.value=clock;mat.uniforms.strength.value=weight;ash.position.set(player.pos.x,player.pos.y,player.pos.z);
  if(weight>0&&player.pos.y>3.6){skyU.uTop.value.lerp(new THREE.Color('#271d2d'),weight);skyU.uHorizon.value.lerp(new THREE.Color('#bf693f'),weight*.75);scene.fog.color.lerp(new THREE.Color('#63404a'),weight);}
  syncAshFog(scene,fogUniform,player.pos.y>3.6?weight:0);
  if(weight===0){if(groups.size){for(const g of groups.values())remove(g);groups.clear();bounds.length=0;last=''}return}
  if(!factory)factory=createAshFactory(THREE);factory.uniforms.uTime.value=clock;
  const cx=Math.floor(player.pos.x/24),cz=Math.floor(player.pos.z/24),key=cx+','+cz;if(key===last)return;last=key;
  const keep=new Set();for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(isAshLand((cx+i)*24+12,(cz+j)*24+12))keep.add((cx+i)+','+(cz+j));
  for(const [k,g]of groups)if(!keep.has(k)){remove(g);groups.delete(k)}
  const ids=['dead_tree_a','dead_tree_b','wall_ruin','barrel','grave_cross','wreck_truck'];
  for(const k of keep)if(!groups.has(k)){const [a,b]=k.split(',').map(Number),g=new THREE.Group();
   for(let i=0;i<7;i++){let x=a*24+2+hash(a+i,b,seed)*20,z=b*24+2+hash(a,b+i,seed+3)*20; if(!isAshLand(x,z)){for(let k=0;k<16;k++){const tx=a*24+1+(k%4)*6,tz=b*24+1+Math.floor(k/4)*6;if(isAshLand(tx,tz)){x=tx;z=tz;break}}} if(!isAshLand(x,z))continue;const id=ids[Math.floor(hash(a+i,b-i,seed+7)*ids.length)],def=factory.models.find(d=>d.id===id);if(!def)continue;const inst=factory.instance(def);inst.root.position.set(x,terrainHeight(x,z),z);inst.root.rotation.y=hash(a+i,b,seed+9)*6.28;inst.root.scale.setScalar(.7);g.add(inst.root)}scene.add(g);groups.set(k,g)}
  bounds.length=0;for(const g of groups.values())g.children.forEach(o=>bounds.push(new THREE.Box3().setFromObject(o)));
 }
 function blocks(x,y,z){return bounds.some(b=>x+.27>b.min.x&&x-.27<b.max.x&&z+.27>b.min.z&&z-.27<b.max.z&&y+1.35>b.min.y+.1&&y<b.max.y)}
 function dispose(){for(const g of groups.values())remove(g);groups.clear();bounds.length=0;scene.remove(ash);geo.dispose();mat.dispose();factory?.dispose()}
 return {update,blocks,dispose,get chunks(){return groups.size},get population(){return [...groups.values()].reduce((n,g)=>n+g.children.length,0)}};
}
