// Seeded continuous sea floor; used by BOTH renderer and collision sampling.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
function hash(x,z,s){let n=Math.imul(x|0,374761393)^Math.imul(z|0,668265263)^Math.imul(s|0,362437);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296}
function noise(x,z,s){const a=Math.floor(x),b=Math.floor(z),u=smooth(0,1,x-a),v=smooth(0,1,z-b);return (hash(a,b,s)*(1-u)+hash(a+1,b,s)*u)*(1-v)+(hash(a,b+1,s)*(1-u)+hash(a+1,b+1,s)*u)*v}
const fbm=(x,z,s)=>noise(x,z,s)*.56+noise(x*2.03,z*2.03,s+9)*.3+noise(x*4.07,z*4.07,s+13)*.14;
export function seabedHeight(x,z,seed=1337){
 const off=Math.max(0,-x,x-64,-z,z-64),gx=Math.round((x-128)/220),gz=Math.round((z-128)/220);
 let y=1+(fbm(x*.10,z*.10,seed)-.5)*.7-smooth(0,30,off)*6.5;
 const deep=smooth(10,25,off);
 y+=deep*(3.3*(fbm(x*.04,z*.09,seed+40)-.5)+2.7*(fbm(z*.10,x*.035,seed+42)-.5));
 for(let iz=gz-1;iz<=gz+1;iz++)for(let ix=gx-1;ix<=gx+1;ix++){
  const cx=128+ix*220+(hash(ix,iz,seed)-.5)*60,cz=128+iz*220+(hash(ix,iz,seed+1)-.5)*60;
  y+=smooth(1.5,.05,Math.hypot((x-cx)/25,(z-cz)/25))*12*deep;
 }
 // A reachable emergent island across the water, not scenery. Gradient .26 = 14.6 degrees.
 const islandShelf=islandShelfHeight(x,z,seed);
 y+=islandShelf;
 return Math.max(-12,y);
}

export function shoreSeabedHeight(x,z,seed,edgeHeight){
 const deep=seabedHeight(x,z,seed);
 if(x<40||x>=112)return deep;
 const t=clamp((x-40)/72,0,1);
 return edgeHeight*(1-t)+deep*t;
}

// Reachable seeded shelves repeat across the open ocean, sharing height with collision.
export function islandShelfHeight(x,z,seed=1337){
 const gx=Math.round((x-145)/220),gz=Math.round((z-32)/220);
 let y=0;
 for(let ix=gx-1;ix<=gx+1;ix++)for(let iz=gz-1;iz<=gz+1;iz++){
  const cx=145+ix*220+(ix===0&&iz===0?0:(hash(ix,iz,seed)-.5)*20);
  const cz=32+iz*220+(ix===0&&iz===0?0:(hash(ix,iz,seed+1)-.5)*20);
  y=Math.max(y,Math.max(0,62-Math.hypot(x-cx,z-cz))*.26);
 }
 return y;
}
export function landWithin(x,z,seed=1337,radius=70,sea=3.8){
 for(let dz=-radius;dz<=radius;dz+=5)for(let dx=-radius;dx<=radius;dx+=5){
  if(dx*dx+dz*dz<=radius*radius&&seabedHeight(x+dx,z+dz,seed)>sea)return true;
 }
 return false;
}

// Actual walkable beach corridor on the accepted island's EAST edge.
// The island voxels are unchanged; the surface mesh and physics share this profile.
export function coastalBeachHeight(x,z,seed,edgeHeight,baseHeight){
 const lateral=1-smooth(10,19,Math.abs(z-32));
 if(x<48||x>=104||lateral<=0)return baseHeight;
 const peak=4,shallow=.42;
 let profile;
 if(x<=58)profile=edgeHeight+(peak-edgeHeight)*(x-48)/10;
 else if(x<=76)profile=peak+(shallow-peak)*(x-58)/18;
 else profile=shallow+(shoreSeabedHeight(104,z,seed,edgeHeight)-shallow)*(x-76)/28;
 return baseHeight+(profile-baseHeight)*lateral;
}
