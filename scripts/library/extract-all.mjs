import {ROOT,buildLibrary} from './machine.mjs';
try {
  const index=buildLibrary(ROOT);
  for(const game of index.games)console.log(game.game+': assets '+game.assets+', file assets '+game.file_assets+', solutions '+game.solutions);
  console.log('Copied '+index.copied_bytes+' of '+index.copy_limit_bytes+' allowed bytes');
} catch(error){console.error(error.stack||error);process.exitCode=1;}
