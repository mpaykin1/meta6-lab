// ROT.js 2.2.1: only topology. Original collision and Sprite Stacking remain authoritative.
export function createLinkedMaze(ROT, originalPlan,{losses=0,deaths=0,circle=1}={}){
 const extra=Math.min(5,Math.max(0,Math.floor(Number(losses)||0))),d=Math.max(1,Math.floor(deaths)||1);
 const base=originalPlan(d);if(!extra||!ROT?.Map?.EllerMaze||!ROT?.Path?.AStar)return base;
 const P=originalPlan(d+extra),n=P.Gs,o=P.o,top=P.top,size=2*n+1,D=P.D,seed=(104729*Math.max(1,circle)+7919*extra+97*d)>>>0;
 const turns=sol=>sol.slice(2).filter((v,k)=>v[0]-sol[k+1][0]!==sol[k+1][0]-sol[k][0]||v[1]-sol[k+1][1]!==sol[k+1][1]-sol[k][1]).length;
 const target=turns(base.sol)+extra,minLen=base.sol.length+extra,center=(x,y)=>[2*(x-o)+1,2*(y-o)+1];
 let chosen=null,best=null;
 const old=ROT.RNG.getState();try{
 ROT.RNG.setSeed(seed||1);
 for(let attempt=0;attempt<180&&!chosen;attempt++){
  const grid=Array.from({length:size},()=>new Uint8Array(size).fill(1));
  new ROT.Map.EllerMaze(size,size).create((x,y,v)=>{grid[x][y]=v;});
  const passable=(x,y)=>x>0&&y>0&&x<size-1&&y<size-1&&grid[x][y]===0;
  for(let si=0;si<n&&!chosen;si++){
   const sx=o+(si+(n>>1))%n,sy=o,[gx,gy]=center(sx,sy);
   const parent=new Int32Array(size*size).fill(-1),q=[gy*size+gx];parent[q[0]]=q[0];
   for(let k=0;k<q.length;k++){const v=q[k],x=v%size,y=(v/size)|0;for(const [dx,dy] of D){const xx=x+dx,yy=y+dy,w=yy*size+xx;if(passable(xx,yy)&&parent[w]<0){parent[w]=v;q.push(w);}}}
   for(let ei=0;ei<n;ei++){
    const ex=o+(ei+(n>>1))%n,[xx,yy]=center(ex,top),dest=yy*size+xx;if(parent[dest]<0)continue;
    const path=[];for(let v=dest;;v=parent[v]){const x=v%size,y=(v/size)|0;if(x%2&&y%2)path.push([o+(x-1)/2,o+(y-1)/2]);if(v===q[0])break;}path.reverse();
    const t=turns(path),score=Math.abs(t-target)*1000+Math.max(0,minLen-path.length);
    if(!best||score<best.score)best={grid,start:[sx,sy],exit:[ex,top],score,attempt};
    if(t===target&&path.length>=minLen){chosen={grid,start:[sx,sy],exit:[ex,top],score,attempt};break;}
   }
  }
 }
 }finally{ROT.RNG.setState(old);}
 const pick=chosen||best;if(!pick)return base;
 const {grid,start,exit}=pick;
 const inR=P.inR,wall=(x,y,k)=>{if(!inR(x,y))return true;const [dx,dy]=D[k];if(!inR(x+dx,y+dy))return !((k===3&&x===start[0]&&y===start[1])||(k===2&&x===exit[0]&&y===exit[1]));const [gx,gy]=center(x,y);return grid[gx+dx][gy+dy]!==0;};
 const open=(x,y,k)=>inR(x+D[k][0],y+D[k][1])&&!wall(x,y,k);
 const bfs=(x,y)=>{const dist=new Int32Array(P.N*P.N).fill(-1),q=[[x,y]];dist[y*P.N+x]=0;for(let k=0;k<q.length;k++){const [i,j]=q[k];for(let a=0;a<4;a++){if(!open(i,j,a))continue;const [dx,dy]=D[a],nx=i+dx,ny=j+dy,id=ny*P.N+nx;if(dist[id]<0){dist[id]=dist[j*P.N+i]+1;q.push([nx,ny]);}}}return dist;};
 const dEx=bfs(...exit),sol=[],[sx,sy]=center(...start),[ex,ey]=center(...exit);
 new ROT.Path.AStar(ex,ey,(x,y)=>x>0&&y>0&&x<size-1&&y<size-1&&grid[x][y]===0,{topology:4}).compute(sx,sy,(x,y)=>{if(x%2&&y%2)sol.push([o+(x-1)/2,o+(y-1)/2]);});
 if(!sol.length||dEx[start[1]*P.N+start[0]]<0)return base;
 return {...P,start,exit,wall,open,bfs,dEx,deg:(x,y)=>D.filter((_,k)=>open(x,y,k)).length,sol,linked:{seed,extra,turns:turns(sol),targetTurns:target,exact:turns(sol)===target,baseLength:base.sol.length,attempt:pick.attempt,engine:'rot-js@2.2.1'}};
}
