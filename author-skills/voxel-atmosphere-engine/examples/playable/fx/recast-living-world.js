/**
 * Voxel Atmosphere Engine · Recast Navigation bridge (MIT original integration).
 * @recast-navigation/core + generators 0.44.0 are upstream MIT modules.
 * All NPCs are separate, authored voxel inhabitants. The original controllable
 * hero and its inputs are NEVER changed or driven by autonomous AI.
 * Modes: WASM Recast/Detour crowd; deterministic collision-aware local A* fallback.
 */
const NAV_VERSION='0.44.0';
const STEP=.68, X0=-15.2, Z0=-12.2, NX=46, NZ=37;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const sqr=x=>x*x;
const distXZ=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const API_PATHS=['./vendor/recast-navigation-core.mjs','@recast-navigation/core'];
const GENERATOR_PATHS=['./vendor/recast-navigation-generators.mjs','@recast-navigation/generators'];

// All blockers are inferred from the original sculpted Goxel GLB, not painted by hand.
export function collectForestObstacles(THREE, forest) {
  forest.updateWorldMatrix(true,true);
  const obstacles=[];
  const box=new THREE.Box3();
  forest.traverse(obj=>{
    if(!obj.isMesh)return;
    const name=obj.name.toLowerCase();
    if(!/tree_trunk|rock_|mushroom_stem|lantern_post|firewood/.test(name))return;
    box.setFromObject(obj);
    const sx=box.max.x-box.min.x,sz=box.max.z-box.min.z;
    const radius=clamp(Math.hypot(sx,sz)*.39+.25,.30,2.0);
    if(radius>0.2&&Number.isFinite(radius))
      obstacles.push({x:(box.min.x+box.max.x)*.5,z:(box.min.z+box.max.z)*.5,r:radius,name});
  });
  // The portal and crystal models are separate GLBs, so use real art anchor data.
  obstacles.push({x:-5,z:-.5,r:1.28,name:'mushroom-house'},
    {x:-7.2,z:2.3,r:.9,name:'mushroom-house'},
    {x:0,z:0,r:.95,name:'campfire'},
    {x:-2.5,z:-8.2,r:1.15,name:'moon-gate'},
    {x:6.4,z:-1.5,r:1.05,name:'crystal-cluster'});
  return obstacles;
}

export function createGridNavigation(obstacles) {
  const cells=new Uint8Array(NX*NZ);
  const idx=(x,z)=>z*NX+x;
  const coords=(x,z)=>({x:Math.round((x-X0)/STEP),z:Math.round((z-Z0)/STEP)});
  const world=(x,z)=>({x:X0+x*STEP,z:Z0+z*STEP});
  const inside=(x,z)=>x>=1&&z>=1&&x<NX-1&&z<NZ-1;
  const blocked=(x,z)=>!inside(x,z)||cells[idx(x,z)]===1;
  for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++){
    const p=world(x,z);
    cells[idx(x,z)]=obstacles.some(o=>sqr(p.x-o.x)+sqr(p.z-o.z)<sqr(o.r+.26))?1:0;
  }
  const nearest=(x,z)=>{
    const c=coords(x,z);
    c.x=clamp(c.x,1,NX-2);c.z=clamp(c.z,1,NZ-2);
    if(!blocked(c.x,c.z))return c;
    for(let r=1;r<10;r++){
      let best=null,bestD=Infinity;
      for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
        if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;
        const nx=c.x+dx,nz=c.z+dz;
        if(blocked(nx,nz))continue;
        const d=dx*dx+dz*dz;
        if(d<bestD){bestD=d;best={x:nx,z:nz}};
      }
      if(best)return best;
    }
    return null;
  };
  function clearLine(a,b) {
    const n=Math.max(1,Math.ceil(distXZ(a,b)/(.25)));
    for(let k=0;k<=n;k++){
      const t=k/n,p=coords(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t);
      if(blocked(p.x,p.z))return false;
    }
    return true;
  }
  function path(start,end) {
    const s=nearest(start.x,start.z),g=nearest(end.x,end.z);
    if(!s||!g)return [];
    const startI=idx(s.x,s.z),goalI=idx(g.x,g.z);
    if(startI===goalI)return [world(g.x,g.z)];
    const count=NX*NZ,score=new Float32Array(count).fill(Infinity),prev=new Int32Array(count).fill(-1);
    const closed=new Uint8Array(count),queue=[startI];score[startI]=0;
    const dirs=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.4142],[1,-1,1.4142],[-1,1,1.4142],[-1,-1,1.4142]];
    let iters=0;
    while(queue.length&&iters++<count*2){
      let best=0,fBest=Infinity;
      for(let q=0;q<queue.length;q++){
        const k=queue[q],x=k%NX,z=(k/NX)|0;
        const heuristic=Math.hypot(g.x-x,g.z-z);
        const f=score[k]+heuristic;
        if(f<fBest){best=q;fBest=f;}
      }
      const cur=queue.splice(best,1)[0];
      if(cur===goalI)break;
      if(closed[cur])continue;
      closed[cur]=1;
      const x=cur%NX,z=(cur/NX)|0;
      for(const [dx,dz,cost] of dirs){
        const xx=x+dx,zz=z+dz;
        if(blocked(xx,zz))continue;
        // Never cut diagonally through the corner of a tree/rock collider.
        if(dx&&dz&&(blocked(xx,z)||blocked(x,zz)))continue;
        const next=idx(xx,zz);if(closed[next])continue;
        const tentative=score[cur]+cost;
        if(tentative>=score[next])continue;
        score[next]=tentative;prev[next]=cur;
        if(!queue.includes(next))queue.push(next);
      }
    }
    if(prev[goalI]<0)return [];
    const backwards=[];let cur=goalI;
    for(let safe=0;cur!==startI&&safe<count;safe++){
      backwards.push(world(cur%NX,(cur/NX)|0));cur=prev[cur];if(cur<0)return [];
    }
    backwards.reverse();
    // Point visibility smoothing preserves all blocker clearance.
    const smooth=[];
    for(let i=0;i<backwards.length;){
      const from=smooth.length?smooth[smooth.length-1]:start;
      let far=i;
      for(let k=i;k<backwards.length;k++)if(clearLine(from,backwards[k]))far=k;
      smooth.push(backwards[far]);i=far+1;
    }
    return smooth;
  }
  return {path,nearest,world,clearLine,isFree(x,z){const c=coords(x,z);return !blocked(c.x,c.z);},obstacles};
}

/** Generate world-space Recast triangles directly from the exported GLB source. */
export function collectRecastGeometry(THREE,forest) {
  forest.updateWorldMatrix(true,true);
  const positions=[],indices=[];
  const temp=new THREE.Vector3();
  forest.traverse(mesh=>{
    if(!mesh.isMesh||!mesh.geometry?.attributes?.position)return;
    if(!/terrain_|pond_bed|rock_|tree_trunk|mushroom_stem|lantern_post|firewood/.test(mesh.name.toLowerCase()))return;
    const a=mesh.geometry.getAttribute('position'),b=mesh.geometry.index;
    const count=a.count;
    if(positions.length/3+count>16000)return;
    const start=positions.length/3;
    for(let i=0;i<count;i++){
      temp.fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld);
      positions.push(temp.x,temp.y,temp.z);
    }
    if(b)for(let i=0;i<b.count;i++)indices.push(start+b.getX(i));
    else for(let i=0;i<count;i++)indices.push(start+i);
  });
  return {positions,indices};
}

async function loadUpstream() {
  let last;
  // Both modules are resolved through the SAME import map so the WASM instance
  // is shared; never bundle two conflicting Recast cores.
  for(let i=0;i<API_PATHS.length;i++){
    try {
      const [core,gen]=await Promise.all([import(API_PATHS[i]),import(GENERATOR_PATHS[i])]);
      if(!core.init||!core.NavMeshQuery||!core.Crowd||!gen.generateSoloNavMesh)throw Error('Invalid upstream Recast API');
      await core.init();return {core,gen};
    }catch(e){last=e;console.warn('Recast provider unavailable:',API_PATHS[i],e)}
  }
  throw last??Error('No Recast runtime');
}

// These look like the original game's chunky voxel proportions rather than
// imported/copyrighted character art; no player mesh is ever replaced.
function makeCitizen(THREE,scene,profile){
  const root=new THREE.Group();root.name='Forest inhabitant '+profile.name;
  const skin=new THREE.MeshStandardMaterial({color:0xbaa890,roughness:1,flatShading:true});
  const coat=new THREE.MeshStandardMaterial({color:profile.coat,roughness:1,flatShading:true});
  const accent=new THREE.MeshStandardMaterial({color:profile.accent,roughness:1,flatShading:true});
  const bark=new THREE.MeshStandardMaterial({color:0x3b4146,roughness:1,flatShading:true});
  const amber=new THREE.MeshBasicMaterial({color:profile.glow,transparent:true,opacity:.92});
  function part(w,h,d,material,x,y,z,parent=root){
    const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    o.position.set(x,y,z);o.castShadow=false;o.receiveShadow=false;parent.add(o);return o;
  }
  const torso=part(.42,.60,.30,coat,0,.97,0);
  const belt=part(.48,.11,.35,accent,0,.70,0);
  const head=part(.33,.35,.31,skin,0,1.55,0);
  const cap=part(.41,.14,.37,accent,0,1.76,0);
  const eye=part(.23,.034,.027,amber,0,1.56,.17);
  const leftArm=part(.13,.50,.21,coat,-.33,1.02,0);
  const rightArm=part(.13,.50,.21,coat,.33,1.02,0);
  const leftLeg=part(.17,.58,.22,bark,-.14,.34,0);
  const rightLeg=part(.17,.58,.22,bark,.14,.34,0);
  const bag=part(.25,.27,.19,accent,-.25,.91,-.23);
  const charm=part(.1,.13,.06,amber,.28,.88,.09);
  const lamp=new THREE.PointLight(profile.glow,.7,2.2,1.5);lamp.position.set(.35,1,.17);root.add(lamp);
  root.position.set(profile.start[0],0,profile.start[1]);scene.add(root);
  return {root,torso,head,cap,eye,leftArm,rightArm,leftLeg,rightLeg,bag,charm,lamp,profile};
}

const PROFILES=[
 {name:'Moss',coat:0x697e6b,accent:0xb39a76,glow:0xf0b579,start:[-2,2.5],targets:[[-3.5,2.6],[-1.6,5.6],[1.7,4.1]]},
 {name:'Copper',coat:0x997461,accent:0x4a6161,glow:0xffbc71,start:[2.1,2.2],targets:[[3.6,.1],[4.2,5.4],[-.7,2.1]]},
 {name:'Lumen',coat:0x4f777c,accent:0xa7b7a1,glow:0x80f8e8,start:[-3.8,-3.2],targets:[[-1.2,-5.7],[-5.5,-3.1],[-1,1.6]]},
 {name:'Ash',coat:0x715a6a,accent:0xab9786,glow:0xd3bad8,start:[4.3,-5.2],targets:[[2.3,-3.6],[4.8,-7.4],[-.7,-4.2]]},
 {name:'Fern',coat:0x65795a,accent:0xb0a37c,glow:0xddf49b,start:[-6.1,5.1],targets:[[-4.1,5.2],[-8.4,6.8],[-5.3,2.6]]}
];

export function createLivingForest(THREE,scene,forest,hero,options={}) {
  const obstacles=collectForestObstacles(THREE,forest);
  const grid=createGridNavigation(obstacles);
  let mode='ASTAR',clock=0,showPaths=false,disposed=false;
  let recast=null,navMesh=null,query=null,crowd=null;
  const agents=PROFILES.map((p,i)=>{
    const model=makeCitizen(THREE,scene,p);
    const nearest=grid.nearest(model.root.position.x,model.root.position.z);
    if(nearest){const q=grid.world(nearest.x,nearest.z);model.root.position.x=q.x;model.root.position.z=q.z;}
    return {...model,index:i,route:[],pathIndex:0,taskTime:0.5+i*.31,goal:null,
      action:'walk',actionPhase:0,nextGoal:i%3,phase:i*1.84,rapierAgent:null,previous:rootPosition(model.root),currentSpeed:0};
  });
  // Path markers share the same shader/instance draw call and remain hidden by default.
  const dotted=new THREE.InstancedMesh(new THREE.BoxGeometry(.085,.012,.085),
    new THREE.MeshBasicMaterial({color:0x8ee0c4,transparent:true,opacity:.52,depthWrite:false}),128);
  const dotDummy=new THREE.Object3D();dotted.count=0;dotted.visible=false;dotted.frustumCulled=false;scene.add(dotted);
  const api={get mode(){return mode},get count(){return agents.length},get obstacles(){return obstacles.length},
    togglePaths(){showPaths=!showPaths;dotted.visible=showPaths;return showPaths},
    getAgents(){return agents.map(a=>({name:a.profile.name,x:a.root.position.x,z:a.root.position.z,action:a.action}))},
    update,dispose,ready:null};

  const destinations=(agent)=>{
    const goal=agent.profile.targets[agent.nextGoal++%agent.profile.targets.length];
    const c=grid.nearest(goal[0],goal[1]);
    if(!c)return null;const p=grid.world(c.x,c.z);return {x:p.x,y:0,z:p.z};
  };
  function setGoal(a){
    const target=destinations(a);if(!target)return;
    a.goal=target;a.action='walk';a.taskTime=7.5+a.index*.7;
    a.route=grid.path(a.root.position,target);a.pathIndex=0;
    if(mode==='RECAST'&&a.rapierAgent){
      try {const nearest=query.findClosestPoint(target);a.rapierAgent.requestMoveTarget(nearest.success?nearest.point:target)}
      catch(e){console.warn('Recast target failed for NPC; using local path',e);a.rapierAgent=null}
    }
  }
  function update(dt,elapsed){
    if(disposed)return;
    dt=Math.min(Math.max(dt,0),.05);clock+=dt;
    if(crowd&&mode==='RECAST') {
      try {crowd.update(1/60,dt,4)}catch(error){console.warn('Recast stepping failed; A* fallback active',error);mode='ASTAR';crowd=null}
    }
    for(const a of agents){
      a.taskTime-=dt;
      if((!a.goal&&a.taskTime<=0)||(a.goal&&a.taskTime<-1.5))setGoal(a);
      const oldX=a.root.position.x,oldZ=a.root.position.z;
      if(mode==='RECAST'&&a.rapierAgent){
        try{
          const p=a.rapierAgent.interpolatedPosition||a.rapierAgent.position();
          if(p&&Number.isFinite(p.x)&&Number.isFinite(p.z)){
            a.root.position.x=p.x;a.root.position.z=p.z;
          }
        }catch(_){a.rapierAgent=null}
      }
      if(mode==='ASTAR'||!a.rapierAgent){
        const target=a.route[a.pathIndex];
        if(target){
          const dx=target.x-a.root.position.x,dz=target.z-a.root.position.z,len=Math.hypot(dx,dz);
          const speed=(.62+a.index*.09)*dt;
          if(len<.15){a.pathIndex++}else{
            const d=Math.min(len,speed),nx=a.root.position.x+dx/len*d,nz=a.root.position.z+dz/len*d;
            if(grid.isFree(nx,nz)){a.root.position.x=nx;a.root.position.z=nz}
            else {a.route=grid.path(a.root.position,a.goal);a.pathIndex=0;}
          }
        }
      }
      const dx=a.root.position.x-oldX,dz=a.root.position.z-oldZ;
      const speed=dt>0?Math.hypot(dx,dz)/dt:0;
      a.currentSpeed=THREE.MathUtils.lerp(a.currentSpeed,speed,clamp(dt*6,0,1));
      const moving=a.currentSpeed>.06;
      if(moving){
        const wanted=Math.atan2(dx,dz);
        let dif=((wanted-a.root.rotation.y+Math.PI*3)%(2*Math.PI))-Math.PI;
        a.root.rotation.y+=dif*clamp(dt*6,0,1);
      }
      const reached=a.goal&&distXZ(a.root.position,a.goal)<.65;
      if(reached&&a.action==='walk'){
        a.action=['inspect','wave','rest','listen','lantern'][a.index];
        a.actionPhase=clock;a.taskTime=2.3+(a.index%3)*.8;
        a.route=[];a.pathIndex=0;a.goal=null;
        if(a.rapierAgent&&mode==='RECAST')a.rapierAgent.resetMoveTarget();
      }
      if(!moving&&a.taskTime<0)setGoal(a);
      const phase=clock*10+a.phase;
      const step=Math.sin(phase)*Math.min(1,a.currentSpeed*1.5);
      a.leftLeg.rotation.x=step*.53;
      a.rightLeg.rotation.x=-step*.53;
      a.leftArm.rotation.x=-step*.35;
      a.rightArm.rotation.x=step*.35;
      a.leftArm.rotation.z=0;a.rightArm.rotation.z=0;
      a.torso.scale.y=1+.018*Math.sin(clock*1.7+a.phase);
      a.root.position.y=.018*Math.sin(clock*2+a.phase)+(moving?.04*Math.abs(Math.sin(phase)):0);
      a.head.rotation.y=.12*Math.sin(clock*.9+a.phase);
      a.cap.position.y=1.76+.024*Math.sin(clock*1.5+a.phase);
      a.eye.visible=Math.sin(clock*1.1+a.phase*4)>-.98; // short independent blinks
      if(!moving){
        switch(a.action){
          case 'inspect':a.rightArm.rotation.x=-.7-.3*Math.sin(clock*1.8);a.head.rotation.x=-.1;break;
          case 'wave':a.rightArm.rotation.z=-1.7-.33*Math.sin(clock*5);a.head.rotation.z=.05*Math.sin(clock*2);break;
          case 'rest':a.leftArm.rotation.x=.6;a.rightArm.rotation.x=.45;a.head.rotation.x=.08;break;
          case 'listen':a.head.rotation.y=.33*Math.sin(clock*1.7);a.leftArm.rotation.z=.3;break;
          case 'lantern':a.rightArm.rotation.x=-1.05;a.lamp.intensity=1.5+.5*Math.sin(clock*4);break;
          default:break;
        }
      }else {a.head.rotation.x=0;a.head.rotation.z=0;a.lamp.intensity=.7+.16*Math.sin(clock*2+a.phase);}
      // When hero approaches, a villager acknowledges them, never moves the hero.
      if(distXZ(a.root.position,hero.position)<1.75&&!moving){
        a.head.rotation.y=Math.atan2(hero.position.x-a.root.position.x,hero.position.z-a.root.position.z)-a.root.rotation.y;
        a.rightArm.rotation.z=-1.2-.24*Math.sin(clock*4+a.phase);
      }
    }
    if(showPaths){
      let k=0;
      for(const a of agents){
        for(let i=a.pathIndex;i<a.route.length&&k<128;i++){
          dotDummy.position.set(a.route[i].x,.07,a.route[i].z);
          dotDummy.scale.setScalar(.8+.18*Math.sin(elapsed*3+a.phase));
          dotDummy.updateMatrix();dotted.setMatrixAt(k++,dotDummy.matrix);
        }
      }
      dotted.count=k;dotted.instanceMatrix.needsUpdate=true;
    }
  }
  function dispose(){
    disposed=true;scene.remove(dotted);dotted.geometry.dispose();dotted.material.dispose();
    for(const a of agents){scene.remove(a.root);a.root.traverse(o=>{
      if(o.isMesh){o.geometry.dispose();o.material.dispose()}
    })}
    try{crowd?.destroy?.();query?.destroy?.();navMesh?.destroy?.()}catch(_){ }
  }
  // Optional real Recast WAsm NavMesh: original GLB triangles -> Recast -> Crowd.
  api.ready=(async()=>{
    const {core,gen}=await loadUpstream();
    if(disposed)return;
    const {positions,indices}=collectRecastGeometry(THREE,forest);
    if(positions.length<9||indices.length<3)throw Error('Original voxel forest has no walkable geometry');
    const config={cs:.24,ch:.15,walkableSlopeAngle:42,walkableHeight:12,walkableClimb:3,walkableRadius:2,
      minRegionArea:8,mergeRegionArea:20,maxEdgeLen:12,maxSimplificationError:1.3,maxVertsPerPoly:6,
      detailSampleDist:6,detailSampleMaxError:1};
    const result=gen.generateSoloNavMesh(positions,indices,config);
    if(!result.success||!result.navMesh)throw Error('Recast returned no navigation mesh');
    navMesh=result.navMesh;
    query=new core.NavMeshQuery(navMesh);
    crowd=new core.Crowd(navMesh,{maxAgents:agents.length,maxAgentRadius:.45});
    let initialized=0;
    for(const a of agents){
      try{
        const loc=query.findClosestPoint({x:a.root.position.x,y:0,z:a.root.position.z});
        if(!loc.success)continue;
        const navAgent=crowd.addAgent(loc.point,{radius:.29,height:1.78,maxAcceleration:3.2,
          maxSpeed:.62+a.index*.09,collisionQueryRange:1.8,pathOptimizationRange:3,separationWeight:1.2});
        if(navAgent){a.rapierAgent=navAgent;initialized++;if(a.goal)navAgent.requestMoveTarget(a.goal)}
      }catch(err){console.warn('One Recast agent failed, preserving A* path',err)}
    }
    if(initialized===0)throw Error('NavMesh has no walkable NPC spawn points');
    mode='RECAST';options.onMode?.(mode,initialized);
    return mode;
  })().catch(error=>{
    console.warn('Recast JS/WASM is optional; deterministic A* navigation stays active.',error);
    mode='ASTAR';options.onMode?.(mode,agents.length);return mode;
  });
  agents.forEach(setGoal);
  return api;
}
function rootPosition(r){return {x:r.position.x,z:r.position.z}}
