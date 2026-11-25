// ROT.js 2.2.1: topology only. Original Sprite Stacking, collisions and music remain authoritative.
export function createLinkedMaze(ROT, originalPlan, {losses=0,deaths=0,circle=1}={}){
 const extra=Math.min(5,Math.max(0,Math.floor(Number(losses)||0)));
 if(!extra)return originalPlan(Math.max(1,deaths));
 const P=originalPlan(Math.max(1,deaths)+extra);
 if(!ROT?.Map?.EllerMaze||!ROT?.Path?.AStar)return P;
 const n=P.Gs, o=P.o, top=P.top, size=n*2+1, seed=(104729*Math.max(1,circle)+7919*extra+97*Math.max(0,deaths))>>>0;
 const grid=Array.from({length:size},()=>new Uint8Array(size).fill(1));
 const old=ROT.RNG.getState();
 try{ROT.RNG.setSeed(seed||1);new ROT.Map.EllerMaze(size,size).create((x,y,v)=>{grid[x][y]=v;});}finally{ROT.RNG.setState(old);}
 const start=P.start.slice(),exit=P.exit.slice(),D=P.D;
 const inR=P.inR;
 const center=(x,y)=>[2*(x-o)+1,2*(y-o)+1];
 const wall=(x,y,d)=>{
  if(!inR(x,y))return true;
  const [dx,dy]=D[d],nx=x+dx,ny=y+dy;
  if(!inR(nx,ny))return !((d===3&&x===start[0]&&y===start[1])||(d===2&&x===exit[0]&&y===exit[1]));
  const [gx,gy]=center(x,y);return grid[gx+dx][gy+dy]!==0;
 };
 const open=(x,y,d)=>inR(x+D[d][0],y+D[d][1])&&!wall(x,y,d);
 const bfs=(x,y)=>{const dist=new Int32Array(P.N*P.N).fill(-1),q=[[x,y]];dist[y*P.N+x]=0;for(let k=0;k<q.length;k++){const [i,j]=q[k];for(let d=0;d<4;d++){if(!open(i,j,d))continue;const [dx,dy]=D[d],nx=i+dx,ny=j+dy,idx=ny*P.N+nx;if(dist[idx]<0){dist[idx]=dist[j*P.N+i]+1;q.push([nx,ny]);}}}return dist;};
 const dEx=bfs(...exit),sol=[];
 const passable=(x,y)=>x>0&&y>0&&x<size-1&&y<size-1&&grid[x][y]===0;
 const [sx,sy]=center(...start),[ex,ey]=center(...exit);
 new ROT.Path.AStar(ex,ey,passable,{topology:4}).compute(sx,sy,(x,y)=>{if(x%2===1&&y%2===1)sol.push([o+(x-1)/2,o+(y-1)/2]);});
 if(!sol.length||dEx[start[1]*P.N+start[0]]<0)return P;
 const turns=sol.slice(2).filter((v,k)=>{const a=sol[k],b=sol[k+1];return v[0]-b[0]!==b[0]-a[0]||v[1]-b[1]!==b[1]-a[1];}).length;
 return {...P,start,exit,wall,open,bfs,dEx,deg:(x,y)=>D.filter((_,d)=>open(x,y,d)).length,sol,linked:{seed,extra,turns,engine:'rot-js@2.2.1'}};
}
