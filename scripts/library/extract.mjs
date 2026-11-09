import {ROOT,assertRequested,buildLibrary} from './machine.mjs';
try {
  const source=assertRequested(ROOT,process.argv[2]);
  const index=buildLibrary(ROOT);
  const entry=index.games.find(g=>g.source_root===source);
  console.log(JSON.stringify({source,...entry}));
} catch(error){console.error(error.stack||error);process.exitCode=1;}
