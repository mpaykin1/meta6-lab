/** Three.js visual-stage composer for META GAME FUSION v1.2.
 * This module adds atmospheric VISUAL geometry only. It never overrides
 * Rapier bodies, Recast navigation, the approved model library, or hero actions.
 * All characters must be rigged/animated separately from this scenery.
 */
import * as THREE from 'three';

const PAL = Object.freeze({
  nocturne:{stone:'#27313c',leaf:'#2a545a',fire:'#8fcae1',rune:'#c1dbe6',dust:'#98b5c4'},
  ink:{stone:'#343d48',leaf:'#697961',fire:'#ead6ad',rune:'#eee8d0',dust:'#e1dccc'},
  ember:{stone:'#45303c',leaf:'#6f3c41',fire:'#ff8453',rune:'#ffb589',dust:'#ffb19a'},
  horror:{stone:'#18242b',leaf:'#2e4b42',fire:'#9cddc8',rune:'#8eb6aa',dust:'#9fb6ae'},
  dream:{stone:'#3d3455',leaf:'#71629c',fire:'#e4a1e5',rune:'#e3c6fc',dust:'#d5a9ec'},
  pixel:{stone:'#394447',leaf:'#617e63',fire:'#ffc389',rune:'#f3d2a4',dust:'#d7c9a2'},
});
const palette=(s)=>PAL[s]||PAL.nocturne;
const hash32=(n)=>{n=Math.imul(n^n>>>16,0x7feb352d);n=Math.imul(n^n>>>15,0x846ca68b);return(n^n>>>16)>>>0;};
const rng=(seed)=>{let n=hash32(seed)||1;return()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return(n>>>0)/4294967296;};};
const num=(x,def,min,max)=>Number.isFinite(x)?Math.max(min,Math.min(max,x)):def;

export class FusionLivingWorld {
  constructor({scene,world,seed=0}) {
    this.scene=scene;this.active='';this.stages=new Map();this.clock=0;
    this.seed=(hash32(seed)>>>0);this.visualBodies=[];this.motes=[];
    const n=Array.isArray(world.nodes)?world.nodes.filter(e=>['scene','mechanic'].includes(e.type)):[];
    if(n.length>24)throw new Error('Too many Three.js stage nodes');
    const styles=world.visual_direction?.by_node||{};
    for(const [index,node] of n.entries()){
      const mark=world.markers?.[node.id];
      if(!mark||!Number.isFinite(mark.z))continue;
      const sty=styles[node.id]||node.visual_style||world.visual_direction?.default||'nocturne';
      const group=this.makeStage({node,mark,index,style:sty,seed:hash32(this.seed+index*1013)});
      this.stages.set(node.id,group);
    }
  }
  makeStage({node,mark,index,style,seed}){
    const random=rng(seed),c=palette(style);
    const group=new THREE.Group();group.name=`MGF visual stage ${node.id}`;
    group.position.set(0,0,mark.z-2.8);this.scene.add(group);
    const rock=new THREE.MeshStandardMaterial({color:c.stone,roughness:.9,metalness:.05});
    const leaf=new THREE.MeshStandardMaterial({color:c.leaf,roughness:.88,side:THREE.DoubleSide});
    const bronze=new THREE.MeshStandardMaterial({color:'#9c7461',roughness:.56,metalness:.45});
    const ember=new THREE.MeshStandardMaterial({color:c.fire,emissive:c.fire,emissiveIntensity:1.15,roughness:.35});
    const stoneGeo=new THREE.DodecahedronGeometry(1,0);
    const coneGeo=new THREE.ConeGeometry(1,1,5);
    const stalkGeo=new THREE.CylinderGeometry(.13,.29,3.3,6);
    const haloGeo=new THREE.TorusGeometry(1.2,.04,5,22);
    const lanternGeo=new THREE.OctahedronGeometry(.17,1);
    const animated=[];const beams=[];
    // Deliberate chapter silhouettes on BOTH shoulders. No phantom world collisions:
    // every decorative prop is outside the Rapier walkable bridge corridor.
    for(const side of [-1,1]){
      const grove=new THREE.Group();grove.position.set(side*(8+random()*2.5),0,-2.5+random()*3.2);group.add(grove);
      for(let j=0;j<4;j++){
        const x=side*(j*1.35+random()*.6),z=(j-1.5)*1.75+random()*1.2;
        const stone=new THREE.Mesh(stoneGeo,rock);stone.scale.set(.55+random()*.5,.45+random()*.8,.42+random()*.7);stone.position.set(x,.1,z);grove.add(stone);
      }
      for(let j=0;j<3;j++){
        const tree=new THREE.Group();tree.position.set(side*(j*1.85),0,-2+j*.9+random()*.3);grove.add(tree);
        const trunk=new THREE.Mesh(stalkGeo,bronze);trunk.position.y=1.55;tree.add(trunk);
        const crown=new THREE.Group();crown.position.y=3.15;tree.add(crown);
        for(let k=0;k<3;k++){
          const cluster=new THREE.Mesh(coneGeo,leaf);
          cluster.position.set((k-1)*.19,.1+k*.55,(k-1)*.1);
          cluster.scale.set(1.15-k*.16,2.1-k*.2,1.1-k*.11);crown.add(cluster);
        }
        animated.push({crown,phase:random()*6.28,rate:.7+random()*.8,amp:.045+random()*.06,base:tree.rotation.y});
      }
      // Suspended luminous signs: oscillating lamp housing, oscillating emission,
      // a gentle wind event rather than frozen objects.
      const mast=new THREE.Group();mast.position.set(side*7.1,0,random()*2-1);group.add(mast);
      const post=new THREE.Mesh(new THREE.CylinderGeometry(.095,.15,5.5,6),bronze);post.position.y=2.65;mast.add(post);
      const cord=new THREE.Mesh(new THREE.CylinderGeometry(.017,.017,.85,5),bronze);cord.position.set(0,5.15,0);mast.add(cord);
      const lampPivot=new THREE.Group();lampPivot.position.y=4.68;mast.add(lampPivot);
      const lamp=new THREE.Mesh(lanternGeo,ember);lampPivot.add(lamp);
      const light=new THREE.PointLight(c.fire,8,8,2);lampPivot.add(light);
      beams.push({lampPivot,light,phase:random()*7,intensity:6+random()*3});
    }
    const ring=new THREE.Mesh(haloGeo,ember);ring.position.set(0,7.4,-7);ring.rotation.set(.35,0,.17);group.add(ring);
    const arc=new THREE.Mesh(new THREE.TorusGeometry(2.5,.18,6,18,Math.PI),rock);
    arc.rotation.z=Math.PI;arc.position.set(0,5.9,-7);group.add(arc);
    const rune=new THREE.Mesh(new THREE.TetrahedronGeometry(.48,1),ember);rune.position.set(0,5.7,-7);group.add(rune);
    // Volume motes on independent phases, across visual foreground and mid-plane.
    const count=90,coords=new Float32Array(count*3),speed=new Float32Array(count),phase=new Float32Array(count);
    for(let i=0;i<count;i++){
      coords[3*i]=(random()-.5)*21;
      coords[3*i+1]=.5+random()*7;
      coords[3*i+2]=(random()-.5)*20;
      phase[i]=random()*6.28;speed[i]=.12+random()*.48;
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(coords,3));
    const point=new THREE.Points(geo,new THREE.PointsMaterial({color:c.dust,size:.075,transparent:true,opacity:.45,depthWrite:false}));
    group.add(point);
    const stage={group,animated,beams,ring,rune,point,coords,phase,speed,style,nodeId:node.id,index,phase0:random()*9,active:0,target:0};
    this.visualBodies.push(stage);this.motes.push(point);
    return stage;
  }
  enter(nodeId){this.active=nodeId;
    for(const s of this.visualBodies)s.target=s.nodeId===nodeId?1:0;
  }
  update(dt,time,quality='cinema'){
    this.clock=time;const step=num(dt,0,0,.12),eco=quality!=='cinema';
    for(const stage of this.visualBodies){
      const p=stage.phase0;
      stage.active=THREE.MathUtils.damp(stage.active,stage.target,2.7,step);
      const glow=.50+stage.active*.75;
      stage.rune.rotation.y=time*.32+p;stage.rune.position.y=5.7+Math.sin(time*1.2+p)*.35;
      stage.ring.rotation.z=.17+Math.sin(time*.19+p)*.1;
      for(const a of stage.animated){
        a.crown.rotation.z=Math.sin(time*a.rate+a.phase)*a.amp;
        a.crown.rotation.x=Math.sin(time*(a.rate*.6)+a.phase)*a.amp*.6;
      }
      for(const b of stage.beams){
        b.lampPivot.rotation.z=Math.sin(time*.93+b.phase)*.16;
        b.lampPivot.rotation.x=Math.sin(time*.7+b.phase)*.11;
        b.light.intensity=b.intensity*glow*(.86+.14*Math.sin(time*3.7+b.phase));
      }
      if(!eco){const attr=stage.point.geometry.attributes.position;
        for(let i=0;i<stage.phase.length;i++){
          const q=i*3;const h=attr.array[q+1]+step*stage.speed[i];
          attr.array[q+1]=h>8.2?.45:h;
          attr.array[q]+=.005*Math.sin(time*.8+stage.phase[i]);
        }
        attr.needsUpdate=true;
      }
      stage.point.visible=quality!=='off';
      stage.point.material.opacity=quality==='cinema'?.22+stage.active*.28:.14;
    }
  }
}
