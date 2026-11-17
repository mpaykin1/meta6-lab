import {main,markNoData} from './build.mjs';

main().catch(async error=>{
  console.error('КАРТА СИЛ: сбор не удался, прошлая карта сохранена с пометкой «устарела»:', error);
  try { await markNoData(String(error?.message || error)); }
  catch (writeError) { console.error('Не удалось сбросить старую карту:',writeError); }
  process.exitCode=1;
});
