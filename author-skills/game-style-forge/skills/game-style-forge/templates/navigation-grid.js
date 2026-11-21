/**
 * Author-defined collision fallback, independent of Recast WASM.
 * Uses authored CSG wall proxies and existing cylinder obstacle data, NOT video pixels.
 * Keeps NPCs mobile when browser WASM initialization is unavailable.
 */
export function createGridNavigator(obstacles, options = {}) {
  const cell = 0.75;
  const xmin = -19, xmax = 19, zmin = -33, zmax = 13;
  const width = Math.floor((xmax - xmin) / cell) + 1;
  const height = Math.floor((zmax - zmin) / cell) + 1;
  const blocked = new Uint8Array(width * height);
  const clearance = Math.max(0.22, Number(options.agentRadius) || 0.36);
  const idx = (x,z)=>z*width+x;
  const at = (x,z)=>({x:xmin+x*cell,z:zmin+z*cell});
  const modelBoxes = (Array.isArray(options.modelBoxes) ? options.modelBoxes : []).filter(b=>
    b && [b.x,b.z,b.width,b.depth].every(Number.isFinite) && b.width>0 && b.depth>0);
  const walls = [
    // Physical wall panels around real CSG passage, not the entire arch bounding box.
    [-4.85,-1.76,-14.95,-13.05],
    [1.76,4.85,-14.95,-13.05],
  ];
  for(let gz=0;gz<height;gz++)for(let gx=0;gx<width;gx++){
    const p=at(gx,gz);
    let solid=walls.some(([minx,maxx,minz,maxz])=>p.x>=minx-clearance&&p.x<=maxx+clearance&&p.z>=minz-clearance&&p.z<=maxz+clearance);
    if(!solid)solid=modelBoxes.some(b=>Math.abs(p.x-b.x)<=b.width/2+clearance &&
      Math.abs(p.z-b.z)<=b.depth/2+clearance);
    if(!solid)for(const [x,z,r] of obstacles){
      if(Math.abs(x-p.x)>r+clearance||Math.abs(z-p.z)>r+clearance)continue;
      if((p.x-x)**2+(p.z-z)**2<(r+clearance)**2){solid=true;break;}
    }
    blocked[idx(gx,gz)]=solid?1:0;
  }
  const posToCell = p => ({x:Math.round((p.x-xmin)/cell),z:Math.round((p.z-zmin)/cell)});
  const valid = (x,z)=>x>=0&&z>=0&&x<width&&z<height&&!blocked[idx(x,z)];
  function nearestOpen(p){
    const q=posToCell(p);
    if(valid(q.x,q.z))return q;
    for(let r=1;r<7;r++) for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
      if(Math.abs(dx)!==r&&Math.abs(dz)!==r)continue;
      if(valid(q.x+dx,q.z+dz))return {x:q.x+dx,z:q.z+dz};
    }
    return null;
  }
  // A* with a binary heap. Preserve diagonal corner clearance.
  function path(from,to){
    const start=nearestOpen(from),end=nearestOpen(to);
    if(!start||!end)return [];
    const n=width*height, cost=new Float64Array(n).fill(Infinity),prev=new Int32Array(n).fill(-1);
    const closed=new Uint8Array(n),heap=[];
    const h=(x,z)=>Math.hypot(x-end.x,z-end.z);
    function push(node){heap.push(node);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p].score<=heap[i].score)break;[heap[i],heap[p]]=[heap[p],heap[i]];i=p;}}
    function pop(){if(!heap.length)return null;const out=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;while(true){const l=i*2+1,r=l+1;let m=i;if(l<heap.length&&heap[l].score<heap[m].score)m=l;if(r<heap.length&&heap[r].score<heap[m].score)m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return out;}
    const sid=idx(start.x,start.z),eid=idx(end.x,end.z);cost[sid]=0;push({id:sid,x:start.x,z:start.z,score:h(start.x,start.z)});
    const dirs=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
    let reached=false;
    while(heap.length){const u=pop();if(closed[u.id])continue;closed[u.id]=1;if(u.id===eid){reached=true;break;}
      for(const [dx,dz] of dirs){const x=u.x+dx,z=u.z+dz;if(!valid(x,z))continue;
        if(dx&&dz&&(!valid(u.x+dx,u.z)||!valid(u.x,u.z+dz)))continue;
        const id=idx(x,z),nc=cost[u.id]+(dx&&dz?Math.SQRT2:1);
        if(nc>=cost[id])continue;cost[id]=nc;prev[id]=u.id;push({id,x,z,score:nc+h(x,z)});
      }
    }
    if(!reached)return [];
    const cells=[];let cur=eid;while(cur!==-1){cells.push(cur);if(cur===sid)break;cur=prev[cur];}
    cells.reverse();const points=[];
    for(let i=0;i<cells.length;i++){
      const p=cells[i], c=at(p%width,Math.floor(p/width));
      if(i!==0&&i!==cells.length-1&&i%3!==0)continue;
      points.push({x:c.x,y:0,z:c.z});
    }
    if(points.length){points[points.length-1]={x:to.x,y:0,z:to.z};}
    return points;
  }
  return {mode:'authored-grid-fallback',path};
}
