import './vendor/rot.min.js';
import {createLinkedMaze} from './rot-maze-core.js';
import {Nit} from './nit.js';
export function linkedMaze(originalPlan,deaths,circle){return createLinkedMaze(globalThis.ROT,originalPlan,{losses:Nit.read().luchnik.porazheniya,deaths,circle});}
export function linkedFog(base){return base+.004*Math.min(5,Nit.read().luchnik.porazheniya);}
