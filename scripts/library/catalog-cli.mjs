import {buildCatalog} from './catalog-systems.mjs';
import {ROOT} from './machine.mjs';
const opt=process.argv.slice(2).find(arg=>arg.startsWith('--games='));
const requested=opt?.slice(8).split(',');
const result=buildCatalog(ROOT,requested);
console.log('Catalog: '+result.solution_count+' systems / '+result.game_count+' games');
