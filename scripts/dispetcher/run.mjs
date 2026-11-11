import {main} from './build.mjs';

main().catch(error=>{
 console.error(error);
 process.exitCode=1;
});
