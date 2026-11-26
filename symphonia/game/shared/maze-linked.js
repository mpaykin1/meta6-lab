import './vendor/rot.min.js';
import {createLinkedMaze} from './rot-maze-core.js';
import {mazeDecor} from './wfc-layout.js';
import {createMazeMist} from './living-fog.js';
import {Nit} from './nit.js';
export function linkedMaze(originalPlan,deaths,circle){return createLinkedMaze(globalThis.ROT,originalPlan,{losses:Nit.read().luchnik.porazheniya,deaths,circle});}
export function linkedFog(base){return base+.004*Math.min(5,Nit.read().luchnik.porazheniya);}
export function createMazeWorld(P,losses){
 if(!P.linked||!losses)return null;
 const decor=mazeDecor(P,P.linked.seed),mist=createMazeMist(P.linked.seed,losses);
 return {decor,fog(x,z,t,base){return Math.max(base+.002*losses,mist(x,z,t,base));}};
}
